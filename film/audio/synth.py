#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Uptick Growth -- original sound design, synthesized from scratch.
=================================================================

Every sample in every file this script writes is generated here from noise and
sinusoids.  No recordings, no samples, no libraries of copyrighted material:
the whole soundtrack is original and royalty-free by construction.

Run:
    python3 film/audio/synth.py            (from the repository root)

Output:
    public/film-rd/audio/*.wav   -- 48 kHz, 16-bit PCM
                                    stereo for beds/pads, mono for one-shots

Design rules (from film/audio/NOTES.md):
    * Silence is a material.  Nothing is louder than it needs to be.
    * No whooshes, no risers, no sweeteners.
    * One tempo: 76 bpm (0.789474 s per beat) wherever anything is rhythmic.
    * "Mint" is one clean tone, never a chord.

Implementation notes
--------------------
numpy + the standard library only (no scipy, even where it is installed) so the
script runs anywhere and always produces bit-identical output.  Filtering is
done zero-phase in the frequency domain with Butterworth magnitude responses;
that is circular, which is exactly what we want for the loopable beds (the
filtered noise wraps around perfectly), and for transients we always apply the
amplitude envelope *after* filtering so pre-ringing can never soften an attack.

Determinism: one master seed, a distinct derived seed per cue (see SEEDS).
Rendering is single-threaded and takes well under a minute.
"""

import os

# Keep this polite: a Blender render may be using the CPU.  numpy's FFT is
# single-threaded already; this pins any BLAS that might not be.
for _v in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS",
           "NUMEXPR_NUM_THREADS", "VECLIB_MAXIMUM_THREADS"):
    os.environ.setdefault(_v, "1")

import math
import wave

import numpy as np

# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------

SR = 48000                      # sample rate, Hz
BPM = 76.0                      # the one tempo in the film
BEAT = 60.0 / BPM               # 0.7894736842105263 s
BAR = 4.0 * BEAT                # 3.157894736842105 s

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
OUT_DIR = os.path.join(REPO, "public", "film-rd", "audio")

MASTER_SEED = 0x0FF1CE          # every cue derives its own stream from this

SEEDS = {
    "room-tone": 101, "street-dawn": 102, "street-morning": 103,
    "cafe-interior": 104, "kitchen-evening": 105,
    "key": 201, "key2": 202, "key3": 203, "key-last": 204,
    "tick": 205, "tick-soft": 206, "tap-wood": 207, "press": 208,
    "notify": 209, "send": 210, "scan": 211, "redeem": 212,
    "unfold": 213, "nozzle": 214, "grain": 215,
    "pad-mint": 301, "chord-root": 302, "music-bed": 401,
    "dither": 999,
}

# Equal temperament, A4 = 440 Hz.  The film is in D.
NOTE = {
    "D1": 36.7081, "G1": 48.9994, "A1": 55.0000, "B1": 61.7354,
    "D2": 73.4162, "F#2": 92.4986, "A2": 110.0000,
    "D3": 146.8324, "E3": 164.8138, "F#3": 184.9972, "A3": 220.0000,
    "B3": 246.9417, "C#4": 277.1826, "D4": 293.6648, "E4": 329.6276,
    "F#4": 369.9944, "A4": 440.0000, "C#5": 554.3653, "D5": 587.3295,
    "E5": 659.2551, "F#5": 739.9888, "A5": 880.0000,
}


def rng_for(name):
    """A private, reproducible random stream per cue."""
    return np.random.default_rng(MASTER_SEED + SEEDS[name])


# --------------------------------------------------------------------------
# Small DSP toolkit (numpy only)
# --------------------------------------------------------------------------

def db(x):
    """dBFS -> linear amplitude."""
    return 10.0 ** (x / 20.0)


def dbfs(x):
    """Linear amplitude -> dBFS (guarded against log(0))."""
    return 20.0 * math.log10(max(float(x), 1e-12))


def n_samples(seconds):
    return int(round(seconds * SR))


def t_axis(n):
    return np.arange(n, dtype=np.float64) / SR


def sine(freq, n, phase=0.0, amp=1.0):
    return amp * np.sin(2.0 * np.pi * freq * t_axis(n) + phase)


def white(n, rng):
    return rng.standard_normal(n)


def fft_filter(x, lo=None, hi=None, order=2):
    """Zero-phase Butterworth-magnitude filter.

    lo  -- high-pass corner in Hz (None = no high-pass)
    hi  -- low-pass corner in Hz  (None = no low-pass)
    x   -- (n,) or (channels, n); filtering is circular, so a periodic input
           stays perfectly loopable.
    """
    x = np.asarray(x, dtype=np.float64)
    n = x.shape[-1]
    f = np.fft.rfftfreq(n, 1.0 / SR)
    h = np.ones_like(f)
    if hi is not None:
        h = h / np.sqrt(1.0 + (f / float(hi)) ** (2 * order))
    if lo is not None:
        w = f / float(lo)
        h = h * (w ** order) / np.sqrt(1.0 + w ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x, axis=-1) * h, n=n, axis=-1)


def resonant(x, f0, q=6.0, order=1):
    """Two-pole resonant low-pass magnitude, peak-normalised.

    Used for bodies and formants (the grinder, the wooden tap, cup clinks).
    """
    x = np.asarray(x, dtype=np.float64)
    n = x.shape[-1]
    f = np.fft.rfftfreq(n, 1.0 / SR)
    w = np.maximum(f / float(f0), 1e-9)
    h = 1.0 / np.sqrt((1.0 - w ** 2) ** 2 + (w / q) ** 2)
    h = (h / h.max()) ** order
    return np.fft.irfft(np.fft.rfft(x, axis=-1) * h, n=n, axis=-1)


def tv_lowpass(x, cutoff_at, block=8192, order=2):
    """Time-varying low-pass by overlap-add (Hann, 50% overlap, sums to 1).

    cutoff_at(t_seconds) -> cutoff in Hz.  Used for the car pass, the send
    sweep, the unfold and the rising filter in the music bed's build.
    """
    x = np.asarray(x, dtype=np.float64)
    mono = (x.ndim == 1)
    xx = np.atleast_2d(x)
    ch, n = xx.shape
    hop = block // 2
    nblocks = int(math.ceil(n / hop)) + 2
    pad = np.zeros((ch, nblocks * hop + block))
    pad[:, hop:hop + n] = xx
    out = np.zeros_like(pad)
    win = 0.5 - 0.5 * np.cos(2.0 * np.pi * np.arange(block) / block)
    f = np.fft.rfftfreq(block, 1.0 / SR)
    for b in range(nblocks):
        s = b * hop
        seg = pad[:, s:s + block] * win
        t = (s + block / 2.0 - hop) / SR
        fc = max(float(cutoff_at(t)), 20.0)
        h = 1.0 / np.sqrt(1.0 + (f / fc) ** (2 * order))
        out[:, s:s + block] += np.fft.irfft(
            np.fft.rfft(seg, axis=-1) * h, n=block, axis=-1)
    res = out[:, hop:hop + n]
    return res[0] if mono else res


def env_ad(n, attack, tau, curve=1.0):
    """Raised-cosine attack into an exponential decay (never clicks)."""
    t = t_axis(n)
    a = np.clip(t / max(attack, 1e-9), 0.0, 1.0)
    a = 0.5 - 0.5 * np.cos(np.pi * a)
    return a * np.exp(-(t / max(tau, 1e-9)) ** curve)


def env_bell(n, skew=0.5):
    """A smooth 0->1->0 swell; skew<0.5 peaks early, >0.5 peaks late."""
    p = np.linspace(0.0, 1.0, n, endpoint=False)
    p = p ** (math.log(0.5) / math.log(max(min(skew, 0.95), 0.05)))
    return 0.5 - 0.5 * np.cos(2.0 * np.pi * p)


def fade(x, head=0.005, tail=0.005):
    """Short raised-cosine fades so a non-looping file starts/ends at zero."""
    x = np.asarray(x, dtype=np.float64).copy()
    n = x.shape[-1]
    hn, tn = n_samples(head), n_samples(tail)
    if hn > 0:
        r = 0.5 - 0.5 * np.cos(np.pi * np.linspace(0, 1, hn))
        x[..., :hn] *= r
    if tn > 0:
        r = 0.5 - 0.5 * np.cos(np.pi * np.linspace(0, 1, tn))
        x[..., -tn:] *= r[::-1]
    return x


def ramp(n, points):
    """Piecewise-linear automation curve.  points = [(seconds, value), ...]."""
    t = t_axis(n)
    xs = np.array([p[0] for p in points], dtype=np.float64)
    ys = np.array([p[1] for p in points], dtype=np.float64)
    return np.interp(t, xs, ys)


def pan(mono, pos):
    """Equal-power pan.  pos: -1 (L) .. +1 (R), scalar or per-sample array."""
    a = (np.asarray(pos, dtype=np.float64) + 1.0) * (np.pi / 4.0)
    return np.stack([mono * np.cos(a), mono * np.sin(a)])


def stereo(x):
    x = np.asarray(x, dtype=np.float64)
    return x if x.ndim == 2 else np.stack([x, x])


def add_at(buf, sig, t):
    """Mix `sig` into stereo `buf` starting at t seconds (clipped to length)."""
    i = n_samples(t)
    s = stereo(sig)
    if i < 0:
        s, i = s[:, -i:], 0
    m = min(buf.shape[1] - i, s.shape[1])
    if m > 0:
        buf[:, i:i + m] += s[:, :m]
    return buf


def snap(freq, dur):
    """Snap a frequency to the nearest whole number of cycles in `dur`.

    This is what makes the loopable beds seamless: every periodic component
    (hums, LFOs, pad partials) completes an integer number of cycles in the
    file, so the last sample joins the first with no discontinuity.
    """
    return max(round(freq * dur), 1) / dur


def peak_norm(x, target_db):
    p = np.max(np.abs(x))
    return x if p < 1e-12 else x * (db(target_db) / p)


def soft_clip(x, thresh_db=-13.0):
    """Gentle tanh limiter -- shaves stray peaks without audible pumping."""
    thr = db(thresh_db)
    return thr * np.tanh(x / thr)


def slow_random(n, rng, rate_hz, lo=0.0, hi=1.0):
    """A smooth random control signal (low-passed noise mapped to lo..hi)."""
    v = fft_filter(white(n, rng), hi=rate_hz, order=2)
    v = v / (np.max(np.abs(v)) + 1e-12)
    return lo + (hi - lo) * (0.5 + 0.5 * v)


def modal(freqs, amps, taus, n, attack=0.0008, rng=None, jitter=0.0):
    """Sum of exponentially decaying sinusoids -- struck-object synthesis.

    Everything that "hits" in this film (cups, keys, taps, the tick, the
    nozzle) is a small set of modes, not a filtered click: it is cheaper,
    cleaner and it survives loudspeaker playback far better.
    """
    out = np.zeros(n)
    for f, a, tau in zip(freqs, amps, taus):
        ph = 0.0 if rng is None else rng.uniform(0, 2 * np.pi) * jitter
        out += a * sine(f, n, phase=ph) * env_ad(n, attack, tau)
    return out


def saw_stack(freq, n, voices=3, detune_cents=7.0, harmonics=None, seed=0):
    """A band-limited detuned saw (additive).  Wide, warm, and hard to alias."""
    rng = np.random.default_rng(MASTER_SEED + 7000 + seed)
    if harmonics is None:
        harmonics = int(min(28, max(6, 7000.0 / freq)))
    t = t_axis(n)
    out = np.zeros(n)
    for v in range(voices):
        c = detune_cents * (v - (voices - 1) / 2.0) / max(voices - 1, 1) * 2.0
        f = freq * (2.0 ** (c / 1200.0))
        ph0 = rng.uniform(0, 2 * np.pi, harmonics)
        for k in range(1, harmonics + 1):
            if f * k > 16000.0:
                break
            out += np.sin(2.0 * np.pi * f * k * t + ph0[k - 1]) / k
    return out / voices


def measure(x):
    """(peak dBFS, rms dBFS) of an array."""
    a = np.abs(np.asarray(x, dtype=np.float64))
    rms = math.sqrt(float(np.mean(np.asarray(x, dtype=np.float64) ** 2)))
    return dbfs(a.max()), dbfs(rms)


# --------------------------------------------------------------------------
# WAV output
# --------------------------------------------------------------------------

_dither_rng = np.random.default_rng(MASTER_SEED + SEEDS["dither"])
REPORT = []


def write_wav(name, data, note=""):
    """Write 16-bit PCM at 48 kHz.  (channels, n) -> stereo, (n,) -> mono."""
    x = np.asarray(data, dtype=np.float64)
    if x.ndim == 1:
        frames, ch = x[:, None], 1
    else:
        frames, ch = x.T, x.shape[0]

    peak, rms = measure(x)
    if peak > -0.5:
        raise RuntimeError("%s would clip (%.1f dBFS)" % (name, peak))

    # TPDF dither at 1 LSB -- keeps the very quiet beds free of quantisation
    # granularity; its own noise floor sits near -93 dBFS, i.e. inaudible.
    q = frames * 32767.0
    q = q + (_dither_rng.random(q.shape) + _dither_rng.random(q.shape) - 1.0)
    pcm = np.clip(np.rint(q), -32768, 32767).astype("<i2")

    path = os.path.join(OUT_DIR, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    dur = frames.shape[0] / float(SR)
    size = os.path.getsize(path)
    REPORT.append((name, dur, ch, peak, rms, size, note))
    print("  %-20s %6.2f s  %s  peak %7.2f dBFS  rms %7.2f dBFS  %7.1f kB"
          % (name, dur, "stereo" if ch == 2 else "mono  ", peak, rms,
             size / 1024.0))
    return path


# ==========================================================================
# BEDS
# ==========================================================================

def make_room_tone():
    """30 s, stereo, seamless loop.

    The interior of the film: a low-passed air floor, an air-handler hum at
    60/120 Hz sitting at about -40 dBFS, and a very slow drift so the loop
    never announces itself.  This is what plays under the page in Act I.
    """
    dur, n = 30.0, n_samples(30.0)
    rng = rng_for("room-tone")

    # Air floor: two decorrelated noise streams, low-passed hard.
    air = np.stack([fft_filter(white(n, rng), lo=25, hi=380, order=2)
                    for _ in range(2)])
    air /= np.max(np.abs(air))
    air *= db(-49.0)

    # Air-handler hum.  Integer cycles in 30 s -> the loop joins exactly.
    f60, f120, f180 = snap(60.0, dur), snap(120.0, dur), snap(180.0, dur)
    drift = 1.0 + 0.14 * sine(snap(0.06, dur), n)          # slow level drift
    wob = 1.0 + 0.03 * sine(snap(0.4, dur), n, phase=1.1)  # fan wobble
    hum_l = (sine(f60, n) + 0.45 * sine(f120, n, phase=0.7)
             + 0.10 * sine(f180, n, phase=2.0))
    hum_r = (sine(f60, n, phase=0.05) + 0.42 * sine(f120, n, phase=0.9)
             + 0.09 * sine(f180, n, phase=1.6))
    hum = np.stack([hum_l, hum_r]) * drift * wob
    hum = hum / np.max(np.abs(hum)) * db(-40.0)

    # A breath of duct rumble under everything.
    rumble = np.stack([fft_filter(white(n, rng), lo=18, hi=70, order=3)
                       for _ in range(2)])
    rumble = rumble / np.max(np.abs(rumble)) * db(-46.0)
    rumble *= (1.0 + 0.5 * sine(snap(0.033, dur), n, phase=0.4))

    return air + hum + rumble


def _car_pass(dur_s, rng, lo, hi, close=0.30, side=1, tilt=1.0):
    """A vehicle passing, built from the geometry rather than from a fader.

    The car travels x = -1 .. +1 along a road; the listener stands `close`
    away from it.  Level falls off as 1/(x^2 + close^2), the filter opens as
    it approaches, and the stereo angle is atan2(x, close).  `side` = +1 for
    a left-to-right pass, -1 for right-to-left.  Returns stereo.
    Smaller `close` = a nearer, faster, more sharply panned pass.
    """
    n = n_samples(dur_s)
    t = np.linspace(-1.0, 1.0, n)                  # position along the road
    d2 = t ** 2 + close ** 2                       # squared distance
    amp = (close ** 2 / d2) ** 0.55                # 1 at closest approach
    # taper the ends so the car arrives from, and leaves into, nothing
    amp *= np.sin(np.pi * (t + 1.0) / 2.0) ** 0.35
    amp = amp ** tilt

    src = fft_filter(white(n, rng), lo=60, hi=7000, order=1)

    def cutoff(tt, D=dur_s, LO=lo, HI=hi, C=close):
        u = 2.0 * min(max(tt / D, 0.0), 1.0) - 1.0
        return LO + (HI - LO) * math.sqrt(C * C / (u * u + C * C))
    src = tv_lowpass(src, cutoff)
    src = fft_filter(src, lo=90, order=2)

    # Pan follows the geometry, so the image swings quickly through the centre
    # (where the car is loudest) and lingers at the sides -- which is what
    # makes a pass read as a pass rather than as a fader move.
    p = (2.0 / np.pi) * np.arctan2(t * float(side), close)
    out = pan(src * amp, p)
    return out / (np.max(np.abs(out)) + 1e-12)


def _bird(rng, syllables=2, base=3200.0, up=1500.0, syl=0.055, gap=0.075):
    """A short FM sine glide -- two or three syllables, no more."""
    total = syllables * syl + (syllables - 1) * gap + 0.05
    n = n_samples(total)
    out = np.zeros(n)
    for s in range(syllables):
        m = n_samples(syl)
        t = t_axis(m)
        p = t / syl
        f = base + up * np.sin(np.pi * p) + 90.0 * np.sin(2 * np.pi * 38.0 * t)
        phase = 2.0 * np.pi * np.cumsum(f) / SR
        e = np.sin(np.pi * p) ** 1.4
        seg = np.sin(phase) * e
        seg += 0.18 * np.sin(2 * phase) * e     # a little second harmonic
        start = n_samples(s * (syl + gap))
        out[start:start + m] += seg * (1.0 - 0.25 * s)
    return out / (np.max(np.abs(out)) + 1e-12)


def _door_thud(rng):
    """A door somewhere: a low body plus a dry knock, both short."""
    n = n_samples(0.35)
    body = modal([62.0, 96.0, 143.0], [1.0, 0.45, 0.2],
                 [0.085, 0.055, 0.03], n, attack=0.002)
    knock = fft_filter(white(n, rng), lo=120, hi=1400, order=2)
    knock *= env_ad(n, 0.0015, 0.022)
    x = body + 0.55 * knock
    return x / (np.max(np.abs(x)) + 1e-12)


def make_street_dawn():
    """40 s, stereo, seamless loop.

    Empty early street.  One car far away (12 s, panning L->R over 4 s), two
    birds (6 s, 25 s), a door (18 s).  Everything else is air.  This is the
    world the page lifts into in Act I.
    """
    dur, n = 40.0, n_samples(40.0)
    rng = rng_for("street-dawn")

    bed = np.stack([fft_filter(white(n, rng), lo=70, hi=2200, order=2)
                    for _ in range(2)])
    bed = bed / np.max(np.abs(bed))
    am = (1.0 + 0.30 * sine(snap(0.05, dur), n)
          + 0.18 * sine(snap(0.075, dur), n, phase=2.1)
          + 0.10 * sine(snap(0.125, dur), n, phase=0.6))
    bed *= am
    bed *= db(-40.0) / np.max(np.abs(bed))

    # A far low rumble -- the city's floor, not traffic.
    floor = np.stack([fft_filter(white(n, rng), lo=30, hi=140, order=3)
                      for _ in range(2)])
    floor = floor / np.max(np.abs(floor)) * db(-44.0)
    floor *= (1.0 + 0.4 * sine(snap(0.025, dur), n, phase=1.4))

    out = bed + floor

    # The car pass: 4 s, L -> R, filter opening as it approaches.  It is far
    # away, so `close` is large -- the image swings, but gently.
    car = _car_pass(4.0, rng, lo=420, hi=1800, close=0.30, side=+1)
    add_at(out, fade(car * db(-29.0), 0.04, 0.04), 12.0)

    # Birds -- small, dry, off to one side.
    b1 = _bird(rng, syllables=2, base=3150.0, up=1450.0)
    add_at(out, fade(pan(b1 * db(-31.0), 0.55), 0.002, 0.02), 6.0)
    b2 = _bird(rng, syllables=3, base=2950.0, up=1250.0, syl=0.045, gap=0.06)
    add_at(out, fade(pan(b2 * db(-34.0), -0.62), 0.002, 0.02), 25.0)

    # A door, faint, behind everything.
    add_at(out, fade(pan(_door_thud(rng) * db(-38.0), -0.25), 0.001, 0.02), 18.0)

    return out


def make_street_morning():
    """40 s, stereo.  The same street an hour later.

    Brighter bed, five traffic swells, a bicycle bell at 9 s, and a murmur of
    voices under it.  Acts IX-X ride this as the morning advances.
    """
    dur, n = 40.0, n_samples(40.0)
    rng = rng_for("street-morning")

    bed = np.stack([fft_filter(white(n, rng), lo=80, hi=4200, order=2)
                    for _ in range(2)])
    bed = bed / np.max(np.abs(bed))
    am = (1.0 + 0.22 * sine(snap(0.075, dur), n)
          + 0.14 * sine(snap(0.15, dur), n, phase=1.3))
    bed *= am
    bed *= db(-34.0) / np.max(np.abs(bed))

    floor = np.stack([fft_filter(white(n, rng), lo=35, hi=180, order=3)
                      for _ in range(2)])
    floor = floor / np.max(np.abs(floor)) * db(-38.0)

    # Voice-like murmur: band-passed noise, 300-1200 Hz, syllabic movement.
    mur = np.stack([fft_filter(white(n, rng), lo=300, hi=1200, order=3)
                    for _ in range(2)])
    syl = slow_random(n, rng, 3.2, 0.42, 1.0)
    mur = mur / np.max(np.abs(mur)) * syl * db(-40.0)

    out = bed + floor + mur

    # Traffic: five passes, different speeds, sides and brightness.
    #        start  dur  side  close   lo    hi   level
    passes = [
        (3.5, 3.6, +1, 0.26, 380, 1700, -28.0),
        (12.6, 2.8, -1, 0.20, 500, 2100, -26.5),
        (20.4, 4.4, +1, 0.34, 320, 1400, -30.0),
        (29.2, 3.0, -1, 0.24, 460, 1950, -27.5),
        (35.6, 3.4, +1, 0.30, 400, 1600, -30.5),
    ]
    for (t0, d, side, close, lo, hi, lev) in passes:
        sw = _car_pass(d, rng, lo=lo, hi=hi, close=close, side=side)
        add_at(out, fade(sw * db(lev), 0.04, 0.04), t0)

    # Bicycle bell: two dings at 1.6 kHz with a shimmering upper partial.
    def ding(level):
        m = n_samples(0.55)
        x = modal([1600.0, 1600.0 * 2.76, 1600.0 * 5.4],
                  [1.0, 0.30, 0.10], [0.20, 0.10, 0.05], m, attack=0.0008)
        return x / np.max(np.abs(x)) * db(level)
    bell = np.zeros(n_samples(0.9))
    bell[:n_samples(0.55)] += ding(-26.0)
    o = n_samples(0.24)
    bell[o:o + n_samples(0.55)] += ding(-29.0)
    add_at(out, fade(pan(bell, 0.35), 0.001, 0.05), 9.0)

    return fade(out, 0.02, 0.05)


def make_cafe_interior():
    """30 s, stereo.

    Morning cafe: the grinder finishes at 3 s (with a short spin-down), cups
    at 5/11/17/24 s, and a low conversation bed.  Act VI lives here.
    """
    dur, n = 30.0, n_samples(30.0)
    rng = rng_for("cafe-interior")

    room = np.stack([fft_filter(white(n, rng), lo=45, hi=900, order=2)
                     for _ in range(2)])
    room = room / np.max(np.abs(room)) * db(-42.0)

    # Conversation: two bands of noise with independent syllabic envelopes.
    conv = np.zeros((2, n))
    for band, lev in ((250, -39.0), (700, -41.5)):
        b = np.stack([fft_filter(white(n, rng), lo=band, hi=band * 2.2, order=3)
                      for _ in range(2)])
        e = slow_random(n, rng, 2.6, 0.45, 1.0)
        conv += b / np.max(np.abs(b)) * e * db(lev)

    # A dish-clatter far-field wash, very low.
    clatter = np.stack([fft_filter(white(n, rng), lo=2000, hi=7000, order=2)
                        for _ in range(2)])
    clatter *= slow_random(n, rng, 6.0, 0.0, 1.0) ** 3
    clatter = clatter / np.max(np.abs(clatter)) * db(-48.0)

    out = room + conv + clatter

    # Grinder: burr noise with a resonant body + motor buzz, then a spin-down
    # that ends at 3.0 s.  It is the only thing in the film that stops.
    gn = n_samples(3.35)
    g_src = white(gn, rng)
    g = resonant(g_src, 340.0, q=3.2)
    g += 0.6 * resonant(g_src, 820.0, q=5.0)
    gt = t_axis(gn)
    motor = np.sin(2 * np.pi * 96.0 * gt) * 0.25 + np.sin(2 * np.pi * 192.0 * gt) * 0.12
    g = g / np.max(np.abs(g)) + motor * 0.4
    # amplitude: on, steady, then a fast 250 ms spin-down ending at 3.0 s
    genv = np.ones(gn)
    ah = n_samples(0.12)
    genv[:ah] = 0.5 - 0.5 * np.cos(np.pi * np.linspace(0, 1, ah))
    d0, d1 = n_samples(2.78), n_samples(3.06)
    genv[d0:d1] = np.linspace(1.0, 0.0, d1 - d0) ** 1.7
    genv[d1:] = 0.0
    # spin-down also drops the brightness
    g = tv_lowpass(g * genv, lambda t: 4200.0 if t < 2.78 else
                   max(300.0, 4200.0 * (1.0 - (t - 2.78) / 0.28)))
    g = g / np.max(np.abs(g)) * db(-27.0)
    add_at(out, pan(g, -0.18), 0.0)

    # Cups: short high resonant pings, slightly different each time.
    cup_specs = [
        (5.0, [2650.0, 4180.0, 6420.0], 0.22, -25.0, 0.42),
        (11.0, [3080.0, 4720.0, 7010.0], 0.18, -27.5, -0.36),
        (17.0, [2460.0, 3910.0, 5980.0], 0.25, -26.0, 0.15),
        (24.0, [2880.0, 4460.0, 6650.0], 0.20, -28.5, -0.55),
    ]
    for (t0, modes, tau, lev, pp) in cup_specs:
        m = n_samples(0.6)
        x = modal(modes, [1.0, 0.42, 0.16], [tau, tau * 0.5, tau * 0.28], m,
                  attack=0.0006)
        tick = fft_filter(white(m, rng), lo=3000, hi=11000, order=2)
        tick *= env_ad(m, 0.0004, 0.004)
        x = x / np.max(np.abs(x)) + 0.35 * tick / np.max(np.abs(tick))
        x = x / np.max(np.abs(x)) * db(lev)
        add_at(out, fade(pan(x, pp), 0.0005, 0.05), t0)

    return fade(out, 0.02, 0.05)


def make_kitchen_evening():
    """20 s, stereo.  Act VII's kitchen at 6:52 PM.

    A fridge (50 Hz and its harmonics, with a compressor hiss) and a
    television two rooms away -- band-passed, slow, never intelligible.
    """
    dur, n = 20.0, n_samples(20.0)
    rng = rng_for("kitchen-evening")

    # Fridge: 50 Hz fundamental + harmonics, faint wobble, plus motor hiss.
    fr = np.zeros(n)
    for k, a in ((1, 1.0), (2, 0.42), (3, 0.20), (4, 0.09), (5, 0.05)):
        fr += a * sine(snap(50.0 * k, dur), n, phase=0.3 * k)
    wob = 1.0 + 0.05 * sine(snap(0.35, dur), n) + 0.03 * sine(snap(1.1, dur), n)
    fr *= wob
    fr = fr / np.max(np.abs(fr)) * db(-33.0)
    fridge = np.stack([fr, fr * 0.94])

    hiss = np.stack([fft_filter(white(n, rng), lo=400, hi=3000, order=2)
                     for _ in range(2)])
    hiss = hiss / np.max(np.abs(hiss)) * db(-50.0)

    room = np.stack([fft_filter(white(n, rng), lo=30, hi=300, order=2)
                     for _ in range(2)])
    room = room / np.max(np.abs(room)) * db(-45.0)

    # TV through a wall: 300-900 Hz noise, speech-rate envelope, plus a
    # slower "scene" level that occasionally lifts.
    tv = np.stack([fft_filter(white(n, rng), lo=280, hi=950, order=4)
                   for _ in range(2)])
    speech = slow_random(n, rng, 4.0, 0.15, 1.0)
    scene = slow_random(n, rng, 0.35, 0.45, 1.0)
    tv = tv / np.max(np.abs(tv)) * speech * scene * db(-41.0)

    out = fridge + hiss + room + tv
    return fade(out, 0.03, 0.06)


# ==========================================================================
# ONE-SHOTS  (mono)
# ==========================================================================

def _key_click(seed_name, body_f, click_lo, click_hi, tau_body, lev,
               click_amt=0.5, dur=0.045):
    """A keyboard key: a tiny plastic body plus a dry contact click."""
    rng = rng_for(seed_name)
    n = n_samples(dur)
    body = modal([body_f, body_f * 2.31, body_f * 3.9],
                 [1.0, 0.35, 0.14],
                 [tau_body, tau_body * 0.6, tau_body * 0.35], n, attack=0.0004)
    body /= np.max(np.abs(body))
    click = fft_filter(white(n, rng), lo=click_lo, hi=click_hi, order=2)
    click *= env_ad(n, 0.0002, 0.0035)      # envelope after filtering: no
    click /= np.max(np.abs(click))          # pre-ring, attack stays sharp
    thock = sine(150.0, n) * env_ad(n, 0.0006, 0.012)
    x = body * 0.8 + click * click_amt + thock * 0.30
    x *= env_ad(n, 0.0004, dur * 0.42, curve=1.3)
    return fade(peak_norm(x, lev), 0.0002, 0.004)


def make_keys():
    """Four keystrokes.  Three ordinary, one cleaner: the last key is the
    first mint, so it is brighter and a little more present."""
    yield "key.wav", _key_click("key", 1120.0, 1800, 6500, 0.011, -21.0)
    yield "key2.wav", _key_click("key2", 1015.0, 1700, 6000, 0.012, -22.0)
    yield "key3.wav", _key_click("key3", 1245.0, 1900, 7000, 0.010, -21.5)
    yield "key-last.wav", _key_click("key-last", 1480.0, 2600, 9500, 0.016,
                                     -18.0, click_amt=0.62, dur=0.055)


def make_tick(freq=2200.0, level=-14.0, dur=0.030, seed="tick"):
    """The provenance tick: one sine burst, 30 ms, fast decay.

    The cleanest small sound in the film -- no noise layer at all, so it stays
    legible at any volume and never sounds like a click track.
    """
    n = n_samples(dur)
    x = sine(freq, n) * env_ad(n, 0.0015, dur * 0.26)
    x += 0.10 * sine(freq * 2.0, n) * env_ad(n, 0.0012, dur * 0.14)
    return fade(peak_norm(x, level), 0.0004, 0.004)


def make_tap_wood():
    """A threshold crossing: 110 Hz wooden body with a short noise transient.

    Used identically for every threshold in Act X -- never louder, so the
    count steps on the tap rather than the tap growing with the count.
    """
    rng = rng_for("tap-wood")
    n = n_samples(0.12)
    body = modal([110.0, 268.0, 447.0, 690.0],
                 [1.0, 0.42, 0.18, 0.07],
                 [0.055, 0.030, 0.018, 0.010], n, attack=0.0008)
    body /= np.max(np.abs(body))
    trans = fft_filter(white(n, rng), lo=700, hi=5200, order=2)
    trans *= env_ad(n, 0.0003, 0.0045)
    trans /= np.max(np.abs(trans))
    x = body + 0.34 * trans
    x *= env_ad(n, 0.0006, 0.055, curve=1.15)
    return fade(peak_norm(x, -17.0), 0.0003, 0.006)


def make_press():
    """Approve: a two-layer thock, 90 ms.  180 Hz body + a 3 kHz contact
    click.  One press, no confirmation tone after it."""
    rng = rng_for("press")
    n = n_samples(0.09)
    body = modal([180.0, 362.0, 540.0], [1.0, 0.30, 0.12],
                 [0.030, 0.018, 0.010], n, attack=0.0007)
    body /= np.max(np.abs(body))
    click = modal([3000.0, 4350.0], [1.0, 0.35], [0.0045, 0.003], n,
                  attack=0.0002)
    click /= np.max(np.abs(click))
    air = fft_filter(white(n, rng), lo=1200, hi=7000, order=2)
    air *= env_ad(n, 0.0002, 0.003)
    air /= np.max(np.abs(air))
    x = body + 0.30 * click + 0.18 * air
    x *= env_ad(n, 0.0005, 0.034, curve=1.2)
    return fade(peak_norm(x, -16.0), 0.0003, 0.005)


def make_notify():
    """A soft two-note text tone, 660 -> 880 Hz, 90 ms each, -18 dBFS."""
    n = n_samples(0.20)
    x = np.zeros(n)
    for i, f in enumerate((660.0, 880.0)):
        m = n_samples(0.09)
        seg = sine(f, m) * env_ad(m, 0.012, 0.045)
        seg += 0.12 * sine(f * 2.0, m) * env_ad(m, 0.012, 0.028)
        seg *= 0.5 - 0.5 * np.cos(np.pi * np.clip(
            np.linspace(0, 1, m) * 12.0, 0, 1))   # extra-soft attack
        x[n_samples(i * 0.095):n_samples(i * 0.095) + m] += seg
    return fade(peak_norm(x, -18.0), 0.001, 0.01)


def make_send():
    """An ordinary text send: a short rising filtered-noise sweep, 180 ms.

    Ordinary is the point -- Act VII's question is sent at ordinary volume,
    and then everything stops."""
    rng = rng_for("send")
    n = n_samples(0.18)
    src = fft_filter(white(n, rng), lo=200, hi=9000, order=1)
    sw = tv_lowpass(src, lambda t: 400.0 + 2100.0 * min(t / 0.18, 1.0) ** 1.4,
                    block=2048)
    sw = fft_filter(sw, lo=350, order=2)
    env = env_bell(n, skew=0.62) ** 1.25
    x = sw * env
    return fade(peak_norm(x, -20.0), 0.003, 0.02)


def make_scan():
    """A short clean chirp, 1.2 -> 2.4 kHz over 80 ms."""
    n = n_samples(0.08)
    t = t_axis(n)
    f = 1200.0 + 1200.0 * (t / 0.08)
    ph = 2.0 * np.pi * np.cumsum(f) / SR
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.8
    x = np.sin(ph) * env + 0.08 * np.sin(2 * ph) * env
    return fade(peak_norm(x, -17.0), 0.002, 0.008)


def make_redeem():
    """The redemption: D4 + A4, 20 ms attack, 900 ms decay, warm.

    Triangle-ish partials (odd harmonics falling as 1/n^2) so it is a note,
    not a chime.  The clearest note in the film."""
    n = n_samples(1.0)
    x = np.zeros(n)
    for f, w in ((NOTE["D4"], 1.0), (NOTE["A4"], 0.72)):
        for k, sign in ((1, 1), (3, -1), (5, 1), (7, -1), (9, 1)):
            a = sign / float(k * k)
            tau = 0.30 / (1.0 + 0.55 * math.log2(k))     # highs decay first
            x += w * a * sine(f * k, n) * env_ad(n, 0.020, tau)
    # a soft sub to give it a floor
    x += 0.22 * sine(NOTE["D3"], n) * env_ad(n, 0.025, 0.34)
    # 900 ms overall decay to silence
    x *= np.clip(1.0 - t_axis(n) / 0.92, 0.0, 1.0) ** 1.6
    return fade(peak_norm(x, -15.0), 0.001, 0.02)


def make_unfold():
    """A paper unfold, 300 ms: shaped noise with a couple of crinkle events."""
    rng = rng_for("unfold")
    n = n_samples(0.30)
    src = fft_filter(white(n, rng), lo=900, hi=12000, order=1)
    src = tv_lowpass(src, lambda t: 2600.0 + 5200.0 * math.sin(
        math.pi * min(max(t / 0.30, 0.0), 1.0)), block=2048)
    env = env_bell(n, skew=0.42) ** 1.6
    x = src * env / (np.max(np.abs(src * env)) + 1e-12)
    # two small crinkles riding the middle of the gesture
    for t0, lv in ((0.085, 0.55), (0.175, 0.40)):
        m = n_samples(0.03)
        c = fft_filter(white(m, rng), lo=2500, hi=9000, order=2)
        c *= env_ad(m, 0.0006, 0.007)
        i = n_samples(t0)
        x[i:i + m] += lv * c / (np.max(np.abs(c)) + 1e-12)
    return fade(peak_norm(x, -22.0), 0.004, 0.03)


def make_nozzle():
    """A fuel nozzle: a metallic double transient, ~150 ms apart-ish.

    Inharmonic modes and a hard, short decay -- steel, not a bell."""
    rng = rng_for("nozzle")
    n = n_samples(0.22)
    x = np.zeros(n)
    for i, (t0, lev) in enumerate(((0.0, 1.0), (0.052, 0.72))):
        m = n_samples(0.16)
        modes = [1850.0, 2790.0, 4310.0, 6120.0]
        modes = [f * (1.0 + 0.015 * i) for f in modes]
        y = modal(modes, [1.0, 0.62, 0.34, 0.15],
                  [0.020, 0.013, 0.008, 0.005], m, attack=0.00025)
        y /= np.max(np.abs(y))
        cl = fft_filter(white(m, rng), lo=1500, hi=9000, order=2)
        cl *= env_ad(m, 0.0002, 0.0025)
        y += 0.45 * cl / np.max(np.abs(cl))
        lowth = sine(190.0, m) * env_ad(m, 0.0004, 0.010) * 0.25
        j = n_samples(t0)
        x[j:j + m] += lev * (y + lowth)
    return fade(peak_norm(x, -18.0), 0.0003, 0.01)


def make_grain():
    """A dry patter of tiny grains, 600 ms -- facts landing.

    Deterministic times, thinning towards the end, each grain 3-6 ms."""
    rng = rng_for("grain")
    n = n_samples(0.60)
    x = np.zeros(n)
    times = []
    t = 0.008
    while t < 0.55:
        times.append(t)
        # density thins out as the patter settles
        t += rng.uniform(0.014, 0.030) * (1.0 + 2.6 * (t / 0.55) ** 1.5)
    for t0 in times:
        m = n_samples(rng.uniform(0.003, 0.006))
        f0 = rng.uniform(1500.0, 4200.0)
        g = fft_filter(white(m, rng), lo=f0 * 0.5, hi=f0 * 2.4, order=2)
        g *= env_ad(m, 0.0002, 0.0016)
        g /= (np.max(np.abs(g)) + 1e-12)
        g += 0.25 * sine(f0 * 0.55, m) * env_ad(m, 0.0002, 0.0022)
        lev = rng.uniform(0.35, 1.0) * (1.0 - 0.55 * (t0 / 0.55))
        i = n_samples(t0)
        k = min(m, n - i)
        x[i:i + k] += lev * g[:k]
    return fade(peak_norm(x, -20.0), 0.001, 0.02)


# ==========================================================================
# TONAL BEDS
# ==========================================================================

def make_pad_mint():
    """12 s, stereo, seamless loop.  One sustained soft tone: A3.

    Mint is one clean tone, never a chord.  Slow detuned partials and a gentle
    shimmer; every component completes whole cycles in 12 s so it loops.
    The shimmer is snapped to 0.25 Hz (3 cycles in 12 s) -- the nearest rate
    to the specified 0.2 Hz that keeps the loop seamless.
    """
    dur, n = 12.0, n_samples(12.0)
    base = NOTE["A3"]

    # partial, relative amplitude, detune in cents, pan
    parts = [
        (1.0, 1.00, 0.0, -0.25), (1.0, 0.85, +5.0, 0.30),
        (2.0, 0.34, -3.5, 0.42), (2.0, 0.30, +4.0, -0.38),
        (3.0, 0.14, +2.5, -0.15), (4.0, 0.075, -2.0, 0.20),
        (5.0, 0.030, +3.0, 0.05), (6.0, 0.016, -4.0, -0.45),
    ]
    out = np.zeros((2, n))
    for (mult, amp, cents, pp) in parts:
        f = snap(base * mult * (2.0 ** (cents / 1200.0)), dur)
        v = sine(f, n, amp=amp)
        # each partial breathes at its own slow, loop-locked rate
        lfo = snap(0.25 * (1.0 + 0.5 * (mult - 1.0) / 5.0), dur)
        v *= 1.0 + 0.16 * np.sin(2 * np.pi * lfo * t_axis(n) + mult)
        out += pan(v, pp)

    # the shimmer: a 0.25 Hz breath over the whole tone
    out *= 1.0 + 0.10 * sine(snap(0.25, dur), n)
    out = fft_filter(out, hi=2600, order=2)      # soft, no edge
    out = fft_filter(out, lo=60, order=1)
    return peak_norm(out, -24.0)


def make_chord_root():
    """8 s, stereo.  The low warm root: D2 + A2 + D3 + F#3.

    400 ms attack, decaying to silence by 8 s.  This is what holds under the
    21 in Act XI, and it ends the film by simply running out."""
    dur, n = 8.0, n_samples(8.0)
    voices = [("D2", 1.00, -0.12, 0), ("A2", 0.62, 0.22, 1),
              ("D3", 0.50, -0.34, 2), ("F#3", 0.34, 0.36, 3)]
    out = np.zeros((2, n))
    for (name, amp, pp, sd) in voices:
        f = NOTE[name]
        v = saw_stack(f, n, voices=3, detune_cents=6.0, seed=sd)
        v += 0.5 * sine(f, n)                    # firm up the fundamental
        v = fft_filter(v, hi=1400, order=2)
        v /= np.max(np.abs(v))
        out += pan(v * amp, pp)

    t = t_axis(n)
    att = np.clip(t / 0.40, 0, 1)
    att = 0.5 - 0.5 * np.cos(np.pi * att)
    dec = np.exp(-t / 2.6) * np.clip(1.0 - (t / dur) ** 3.0, 0.0, 1.0)
    out *= att * dec
    out = fft_filter(out, lo=35, order=2)
    return fade(peak_norm(out, -16.0), 0.002, 0.05)


# ==========================================================================
# MUSIC BED
# ==========================================================================

def _pad_chord(freqs, n, seed, spread=0.38):
    """A wide detuned-saw pad, unfiltered (the caller shapes the filter)."""
    out = np.zeros((2, n))
    for i, f in enumerate(freqs):
        v = saw_stack(f, n, voices=3, detune_cents=8.0, seed=seed + i)
        v /= np.max(np.abs(v)) + 1e-12
        p = spread * (2.0 * i / max(len(freqs) - 1, 1) - 1.0)
        out += pan(v * (1.0 / (1.0 + 0.35 * i)), p)
    return out / (np.max(np.abs(out)) + 1e-12)


def make_music_bed():
    """96 s, stereo, 76 bpm, in D.

    0-10   near-silence; a sub-bass D1 swell enters at 6 s
    10-28  soft D pad; quarter-note pulse from 14 s
    28-44  pad lifts to A (voiced as Asus2 so it never fights the arpeggio);
           slow sine arpeggio D-F#-A-D from 32 s
    44-56  the dip -- pad only, no pulse (the provenance passage)
    56-74  the build -- pulse returns, a second arpeggio a fifth up, a rising
           filter on the pad, bass on beats 1 and 3 (D2-A1-B1-G1)
    74-80  the resolve -- one warm D major root chord decaying over 6 s
    80-96  silence but for a faint air

    Nothing exceeds -12 dBFS peak; a gentle soft-clip limiter sits at the end.
    """
    dur, n = 96.0, n_samples(96.0)
    rng = rng_for("music-bed")
    mix = np.zeros((2, n))

    # ---- faint air, present the whole way through -----------------------
    air = np.stack([fft_filter(white(n, rng), lo=40, hi=1600, order=2)
                    for _ in range(2)])
    air = air / np.max(np.abs(air))
    air_lvl = ramp(n, [(0, db(-56)), (10, db(-54)), (44, db(-52)),
                       (74, db(-52)), (80, db(-56)), (92, db(-58)),
                       (96, 0.0)])
    mix += air * air_lvl

    # ---- 0-10 s: near-silence, a sub-bass D1 swell entering at 6 s ------
    sub_n = n_samples(14.0)
    sub = (sine(NOTE["D1"], sub_n) + 0.35 * sine(NOTE["D1"] * 2, sub_n)
           + 0.12 * sine(NOTE["D1"] * 3, sub_n))
    sub /= np.max(np.abs(sub))
    sub_env = ramp(sub_n, [(0, 0.0), (4.0, 1.0), (7.5, 0.75), (11.0, 0.0)])
    sub_env = fft_filter(sub_env, hi=3.0, order=1)          # smooth the corners
    sub = sub * sub_env * db(-27.0)
    add_at(mix, np.stack([sub, sub * 0.97]), 6.0)

    # ---- pads -----------------------------------------------------------
    # D major (10-28 and, after the dip, 44-74); A (28-44) voiced as Asus2.
    def pad_section(t0, t1, freqs, seed, level_env, cutoff_at, fade_in, fade_out):
        m = n_samples(t1 - t0)
        p = _pad_chord(freqs, m, seed)
        p = tv_lowpass(p, cutoff_at, block=8192, order=3)
        e = level_env(m)
        # section fades so chords cross without a click
        fi, fo = n_samples(fade_in), n_samples(fade_out)
        if fi:
            e[:fi] *= 0.5 - 0.5 * np.cos(np.pi * np.linspace(0, 1, fi))
        if fo:
            e[-fo:] *= 0.5 + 0.5 * np.cos(np.pi * np.linspace(0, 1, fo))
        p = p / (np.max(np.abs(p)) + 1e-12) * e
        add_at(mix, p, t0)

    d_major = [NOTE["D2"], NOTE["A2"], NOTE["D3"], NOTE["F#3"], NOTE["A3"]]
    a_sus = [NOTE["A2"], NOTE["E3"], NOTE["A3"], NOTE["B3"]]

    # 10-29.5 : D pad
    pad_section(10.0, 29.5, d_major, 10,
                lambda m: ramp(m, [(0, db(-24)), (3, db(-22)),
                                   (16, db(-22)), (19.5, db(-24))]),
                lambda t: 620.0, 2.2, 1.8)
    # 28-45.5 : lift to A
    pad_section(28.0, 45.5, a_sus, 30,
                lambda m: ramp(m, [(0, db(-26)), (3, db(-21.5)),
                                   (14, db(-21.5)), (17.5, db(-25))]),
                lambda t: 780.0, 2.0, 2.0)
    # 44-56.5 : the dip, back to D, pad alone
    pad_section(44.0, 56.5, d_major, 50,
                lambda m: ramp(m, [(0, db(-27)), (2.5, db(-25)),
                                   (9.0, db(-26)), (12.5, db(-27))]),
                lambda t: 520.0, 2.5, 1.5)
    # 55-74.6 : the build, D pad with a rising filter
    pad_section(55.0, 74.6, d_major, 70,
                lambda m: ramp(m, [(0, db(-26)), (5, db(-22)),
                                   (17, db(-17.5)), (19.0, db(-19)),
                                   (19.6, db(-30))]),
                lambda t: 480.0 + (3000.0 - 480.0) *
                min(max((t - 1.0) / 16.0, 0.0), 1.0) ** 1.5, 2.0, 0.35)

    # ---- the quarter-note pulse (76 bpm) --------------------------------
    def pulse_click(level):
        m = n_samples(0.05)
        rr = np.random.default_rng(MASTER_SEED + 4242)
        c = fft_filter(white(m, rr), lo=250, hi=1400, order=2)
        c *= env_ad(m, 0.0008, 0.010)
        c /= np.max(np.abs(c))
        c += 0.5 * sine(320.0, m) * env_ad(m, 0.0012, 0.012)
        return fade(peak_norm(c, level), 0.0005, 0.008)

    def beats_between(t0, t1):
        b0 = int(math.ceil(t0 / BEAT))
        return [k * BEAT for k in range(b0, int(t1 / BEAT) + 1)
                if t0 <= k * BEAT < t1]

    for t in beats_between(14.0, 44.0):
        strong = (round(t / BEAT) % 4 == 0)
        lv = -29.0 if strong else -32.0
        # ease the pulse in over its first two bars
        ease = min((t - 14.0) / 6.0, 1.0)
        add_at(mix, pan(pulse_click(lv) * ease, 0.0), t)
    for t in beats_between(56.0, 74.0):
        strong = (round(t / BEAT) % 4 == 0)
        g = min((t - 56.0) / 10.0, 1.0)             # crescendo through build
        lv = (-30.0 if strong else -33.0) + 6.0 * g
        add_at(mix, pan(pulse_click(lv), 0.0), t)

    # ---- arpeggios (sine, 1/8 notes) ------------------------------------
    def arp_note(freq, level, length=0.42):
        m = n_samples(length)
        x = sine(freq, m) * env_ad(m, 0.010, 0.11)
        x += 0.16 * sine(freq * 2.0, m) * env_ad(m, 0.010, 0.06)
        x += 0.05 * sine(freq * 3.0, m) * env_ad(m, 0.010, 0.035)
        return peak_norm(x, level)

    eighth = BEAT / 2.0
    # voice 1: D-F#-A-D across two octaves, a six-step figure so it drifts
    # gently against the 4/4 pulse
    v1 = [NOTE["D3"], NOTE["A3"], NOTE["D4"], NOTE["F#4"], NOTE["A4"], NOTE["D5"]]
    t = math.ceil(32.0 / eighth) * eighth
    i = 0
    while t < 44.0:
        lv = -26.0 + (-6.0 if t > 42.0 else 0.0)
        add_at(mix, pan(arp_note(v1[i % len(v1)], lv), 0.30 * math.sin(i * 1.1)), t)
        t += eighth
        i += 1
    t = math.ceil(58.0 / eighth) * eighth
    i = 0
    while t < 74.0:
        g = min((t - 58.0) / 12.0, 1.0)
        lv = -27.0 + 5.0 * g
        if t > 73.0:
            lv -= 8.0
        add_at(mix, pan(arp_note(v1[i % len(v1)], lv), 0.32 * math.sin(i * 1.1)), t)
        t += eighth
        i += 1

    # voice 2: the same figure a fifth up, entering with the build
    v2 = [NOTE["A3"], NOTE["E4"], NOTE["A4"], NOTE["C#5"], NOTE["E5"], NOTE["A5"]]
    t = math.ceil(62.0 / eighth) * eighth
    i = 0
    while t < 74.0:
        g = min((t - 62.0) / 8.0, 1.0)
        lv = -33.0 + 5.0 * g
        if t > 73.0:
            lv -= 8.0
        add_at(mix, pan(arp_note(v2[i % len(v2)], lv, 0.34),
                        -0.34 * math.sin(i * 0.9)), t)
        t += eighth
        i += 1

    # ---- bass, beats 1 and 3, four bars repeating -----------------------
    def bass_note(freq, level, length=1.5):
        m = n_samples(length)
        x = (sine(freq, m) + 0.30 * sine(freq * 2, m)
             + 0.10 * sine(freq * 3, m))
        x /= np.max(np.abs(x))
        x *= env_ad(m, 0.020, length * 0.34, curve=1.2)
        return peak_norm(x, level)

    bass_bars = ["D2", "A1", "B1", "G1"]
    bar0 = math.ceil(56.0 / BAR)
    bi = 0
    while True:
        t_bar = bar0 * BAR + bi * BAR
        if t_bar >= 73.5:
            break
        name = bass_bars[bi % 4]
        for beat in (0, 2):
            t = t_bar + beat * BEAT
            if t >= 73.5:
                break
            g = min(max((t - 56.0) / 14.0, 0.0), 1.0)
            lv = -30.0 + 8.0 * g
            add_at(mix, pan(bass_note(NOTE[name], lv), 0.0), t)
        bi += 1

    # ---- 74-80 s: the resolve.  One D major root chord. ------------------
    res_n = n_samples(6.4)
    res = _pad_chord([NOTE["D2"], NOTE["A2"], NOTE["D3"], NOTE["F#3"],
                      NOTE["A3"], NOTE["D4"]], res_n, 90, spread=0.30)
    res = fft_filter(res, hi=1500, order=2)
    res = fft_filter(res, lo=32, order=2)
    rt = t_axis(res_n)
    r_att = 0.5 - 0.5 * np.cos(np.pi * np.clip(rt / 0.25, 0, 1))
    r_dec = np.exp(-rt / 2.1) * np.clip(1.0 - (rt / 6.0) ** 2.5, 0.0, 1.0)
    res = res / np.max(np.abs(res)) * r_att * r_dec * db(-15.5)
    # a low D underneath so the resolve has a floor
    sub2 = sine(NOTE["D1"] * 2, res_n) * r_att * np.exp(-rt / 1.8) * db(-30.0)
    res += np.stack([sub2, sub2])
    add_at(mix, res, 74.0)

    # ---- master: soft-clip limiter, then peak ceiling -------------------
    mix = fft_filter(mix, lo=24, order=2)          # keep sub-sonic energy out
    mix = soft_clip(mix, thresh_db=-13.0)
    mix = peak_norm(mix, -14.0)                    # ceiling with 2 dB to spare
    return fade(mix, 0.02, 0.30)


# ==========================================================================
# Render
# ==========================================================================

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print("Uptick Growth -- synthesizing to %s" % OUT_DIR)
    print("  sample rate %d Hz, 16-bit PCM, tempo %.0f bpm (%.6f s/beat)\n"
          % (SR, BPM, BEAT))

    print("beds")
    write_wav("room-tone.wav", make_room_tone(), "loop")
    write_wav("street-dawn.wav", make_street_dawn(), "loop")
    write_wav("street-morning.wav", make_street_morning(), "")
    write_wav("cafe-interior.wav", make_cafe_interior(), "")
    write_wav("kitchen-evening.wav", make_kitchen_evening(), "")

    print("one-shots")
    for name, data in make_keys():
        write_wav(name, data, "")
    write_wav("tick.wav", make_tick(2200.0, -14.0, 0.030), "")
    write_wav("tick-soft.wav", make_tick(1600.0, -22.0, 0.030, "tick-soft"), "")
    write_wav("tap-wood.wav", make_tap_wood(), "")
    write_wav("press.wav", make_press(), "")
    write_wav("notify.wav", make_notify(), "")
    write_wav("send.wav", make_send(), "")
    write_wav("scan.wav", make_scan(), "")
    write_wav("redeem.wav", make_redeem(), "")
    write_wav("unfold.wav", make_unfold(), "")
    write_wav("nozzle.wav", make_nozzle(), "")
    write_wav("grain.wav", make_grain(), "")

    print("tonal")
    write_wav("pad-mint.wav", make_pad_mint(), "loop")
    write_wav("chord-root.wav", make_chord_root(), "")
    write_wav("music-bed.wav", make_music_bed(), "")

    total = sum(r[5] for r in REPORT)
    print("\n%d files, %.1f MB total" % (len(REPORT), total / 1e6))

    # A markdown fragment for CUES.md -- measured, not estimated.
    print("\n| file | dur (s) | ch | peak dBFS | rms dBFS | size |")
    print("| --- | ---: | --- | ---: | ---: | ---: |")
    for (name, dur, ch, peak, rms, size, note) in REPORT:
        print("| `%s` | %.2f | %s | %.1f | %.1f | %.0f kB |"
              % (name, dur, "st" if ch == 2 else "mono", peak, rms,
                 size / 1024.0))


if __name__ == "__main__":
    main()
