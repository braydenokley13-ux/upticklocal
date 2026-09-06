#!/usr/bin/env python3
"""Prints the gain (dB) that brings a video's audio true peak to the target.

    scripts/film-peak.py public/film-rd/final/uptick-growth-master-raw.mp4 -1.0
"""
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

src = sys.argv[1]
target = float(sys.argv[2]) if len(sys.argv) > 2 else -1.0
with tempfile.TemporaryDirectory() as d:
    wav = os.path.join(d, "a.wav")
    # 4× oversampled for a true-peak estimate
    subprocess.run(["npx", "remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vn", "-ar", "192000", "-acodec", "pcm_s16le", wav], check=True)
    w = wave.open(wav)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
peak = 20 * np.log10(max(1e-9, np.abs(x).max()))
print(f"{target - peak:.2f}")
