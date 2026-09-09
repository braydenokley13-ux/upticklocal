"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHOTS } from "@/film/compositions";
import { shotFrames } from "@/film/shots";
import { FPS, HEIGHT, WIDTH } from "@/film/tokens";
import "./lab.css";

type Manifest = Record<string, { video?: string; stills?: string[]; contact?: string; renderedAt?: string; note?: string }>;

/**
 * The review stage. One Remotion Player, a transport that thinks in frames,
 * and the render ledger for the selected shot. Deliberately plain: the shot
 * is the thing being looked at.
 */
export default function Stage() {
  const [shotId, setShotId] = useState<string>("Hero1");
  const shot = useMemo(() => SHOTS.find((s) => s.id === shotId)!, [shotId]);
  const total = shotFrames(shot);
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [manifest, setManifest] = useState<Manifest>({});
  const [scale, setScale] = useState(1);

  useEffect(() => {
    fetch("/film-rd/renders/manifest.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then(setManifest)
      .catch(() => setManifest({}));
  }, [shotId]);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    p.addEventListener("ended", onPause);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
      p.removeEventListener("ended", onPause);
    };
  }, [shotId]);

  const seek = useCallback((f: number) => {
    const p = ref.current;
    if (!p) return;
    const clamped = Math.max(0, Math.min(total - 1, Math.round(f)));
    p.pause();
    p.seekTo(clamped);
    setFrame(clamped);
  }, [total]);

  const toggle = useCallback(() => {
    const p = ref.current;
    if (!p) return;
    if (p.isPlaying()) p.pause();
    else p.play();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" && (e.target as HTMLInputElement).type !== "range") return;
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowLeft") seek(frame - (e.shiftKey ? 10 : 1));
      else if (e.key === "ArrowRight") seek(frame + (e.shiftKey ? 10 : 1));
      else if (e.key === "Home") seek(0);
      else if (e.key === "End") seek(total - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [frame, seek, toggle, total]);

  const entry = manifest[shot.id];
  const t = frame / FPS;

  return (
    <div className="lab">
      <header className="lab__head">
        <div>
          <p className="lab__tag">Uptick Growth · Film R&amp;D Lab · {WIDTH}×{HEIGHT} · {FPS} fps</p>
          <h1 className="lab__title">Five hero-shot gates</h1>
        </div>
        <nav className="lab__shots" aria-label="Hero shots">
          {SHOTS.map((s) => (
            <button key={s.id} type="button" className={`lab__shot${s.id === shotId ? " is-active" : ""}`} onClick={() => { setShotId(s.id); setFrame(0); }}>
              <span className="lab__shotn">0{s.index}{s.variant ? ` · ${s.variant}` : ""}</span>
              <span className="lab__shotname">{s.name}</span>
            </button>
          ))}
        </nav>
      </header>

      <section className="lab__stage" aria-label={shot.name}>
        <div className="lab__stagewrap" style={{ transform: `scale(${scale})` }}>
          <Player
            key={shot.id}
            ref={ref}
            component={shot.component}
            durationInFrames={total}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: "100%", aspectRatio: "16 / 9" }}
            controls={false}
            loop={loop}
            clickToPlay={false}
            showVolumeControls={false}
            spaceKeyToPlayOrPause={false}
          />
        </div>
      </section>

      <section className="lab__transport" aria-label="Transport">
        <button type="button" className="lab__btn" onClick={toggle}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className="lab__btn lab__btn--quiet" onClick={() => seek(frame - 1)} aria-label="Previous frame">
          ‹
        </button>
        <button type="button" className="lab__btn lab__btn--quiet" onClick={() => seek(frame + 1)} aria-label="Next frame">
          ›
        </button>
        <input className="lab__scrub" type="range" min={0} max={total - 1} value={frame} onChange={(e) => seek(Number(e.target.value))} aria-label="Scrub" />
        <p className="lab__frame">
          <span>{String(frame).padStart(4, "0")}</span> / {total - 1} · {t.toFixed(2)}s
        </p>
        <label className="lab__check">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> loop
        </label>
        <label className="lab__check">
          size{" "}
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            <option value={1}>fit</option>
            <option value={0.75}>75%</option>
            <option value={0.5}>50%</option>
          </select>
        </label>
      </section>

      <section className="lab__ledger">
        <div>
          <p className="lab__tag">0{shot.index} · {shot.name}</p>
          <p className="lab__line">{shot.line}</p>
          <p className="lab__proves">Gate: {shot.proves}</p>
        </div>
        <div>
          <p className="lab__tag">Renders</p>
          {entry ? (
            <ul className="lab__links">
              {entry.video && (
                <li>
                  <a href={entry.video}>preview · mp4</a>
                </li>
              )}
              {entry.contact && (
                <li>
                  <a href={entry.contact}>contact sheet</a>
                </li>
              )}
              {entry.stills?.map((s) => (
                <li key={s}>
                  <a href={s}>{s.split("/").pop()}</a>
                </li>
              ))}
              {entry.renderedAt && <li className="lab__muted">rendered {entry.renderedAt}</li>}
              {entry.note && <li className="lab__muted">{entry.note}</li>}
            </ul>
          ) : (
            <p className="lab__muted">No render on record for this shot. Run <code>npm run film:render</code>.</p>
          )}
        </div>
        <div>
          <p className="lab__tag">Keys</p>
          <p className="lab__muted">space play/pause · ← → frame · shift+← → ten frames · home/end</p>
        </div>
      </section>
    </div>
  );
}
