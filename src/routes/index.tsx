import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileVideo,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  AlertTriangle,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Video Speed Player — Play Local Videos at Any Speed" },
      {
        name: "description",
        content:
          "Pick a video from your phone and play it from 0.25x to 3x. Works offline, nothing is ever uploaded.",
      },
      { property: "og:title", content: "Video Speed Player" },
      {
        property: "og:description",
        content:
          "Pick a video from your phone and play it from 0.25x to 3x. Works offline, nothing is ever uploaded.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SPEED_KEY = "vsp.speed";
const HISTORY_KEY = "vsp.speedHistory";
const PRESETS = [0.5, 1, 1.5, 2];
const MAX_HISTORY = 8;

type Status = { kind: "idle" | "info" | "ok" | "error"; text: string };

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<Status>({
    kind: "idle",
    text: "Choose a video from your phone to begin.",
  });

  // restore saved speed
  useEffect(() => {
    const saved = Number(localStorage.getItem(SPEED_KEY));
    if (saved >= 0.25 && saved <= 3) setSpeed(saved);
  }, []);

  // apply + persist speed (preserved across video changes)
  useEffect(() => {
    localStorage.setItem(SPEED_KEY, String(speed));
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, fileName]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      const video = videoRef.current;
      if (!file || !video) return;

      if (file.size === 0) {
        setStatus({ kind: "error", text: "That file is empty. Please pick another video." });
        return;
      }

      // clear previous source first
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setFileName(file.name);
      setCurrent(0);
      setDuration(0);
      setPlaying(false);
      setStatus({ kind: "info", text: `Loading “${file.name}”…` });

      video.src = url;
      video.playbackRate = speed;
      video.load();
    },
    [speed],
  );

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
  };

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v || !urlRef.current) return;
    try {
      if (v.paused) {
        await v.play();
      } else {
        v.pause();
      }
    } catch {
      setStatus({ kind: "error", text: "Playback couldn’t start. Tap play again." });
    }
  };

  const onError = () => {
    const err = videoRef.current?.error;
    const map: Record<number, string> = {
      1: "Loading was cancelled.",
      2: "The video could not be read from your device.",
      3: "This video can’t be decoded — the codec isn’t supported by this browser.",
      4: "This file type or codec isn’t supported here. Try an MP4 (H.264) or open it in Safari.",
    };
    setStatus({
      kind: "error",
      text: (err && map[err.code]) || "Something went wrong loading this video.",
    });
    setPlaying(false);
  };

  const hasVideo = Boolean(fileName);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <Gauge className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Video Speed Player</h1>
            <p className="text-xs text-muted-foreground">
              Plays from your device. Nothing is uploaded.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-video w-full bg-black">
            <video
              ref={videoRef}
              className="size-full"
              playsInline
              controls
              preload="metadata"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                v.playbackRate = speed;
                setDuration(v.duration || 0);
                setStatus({ kind: "info", text: "Video details loaded." });
              }}
              onLoadedData={() => setStatus({ kind: "info", text: "First frame ready." })}
              onCanPlay={() => setStatus({ kind: "ok", text: "Ready to play." })}
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onRateChange={(e) => setSpeed(Number(e.currentTarget.playbackRate.toFixed(2)))}
              onStalled={() =>
                setStatus({ kind: "error", text: "Playback stalled — reading the file is slow." })
              }
              onAbort={() => setStatus({ kind: "error", text: "Loading was interrupted." })}
              onError={onError}
            />
            {!hasVideo && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                No video selected
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-opacity active:opacity-80"
            >
              <FileVideo className="size-5" aria-hidden />
              {hasVideo ? "Choose another video" : "Choose a video"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="video/*,.mov,.mp4,.m4v,.qt,.hevc,.avi,.mkv,.webm"
              className="hidden"
              onChange={onPick}
            />

            {fileName && (
              <p className="truncate text-center text-xs text-muted-foreground">{fileName}</p>
            )}

            <div className="grid grid-cols-3 gap-2">
              <ControlButton onClick={() => seekBy(-10)} disabled={!hasVideo} label="Back 10 seconds">
                <RotateCcw className="size-6" aria-hidden />
                <span className="text-xs">-10s</span>
              </ControlButton>
              <ControlButton onClick={togglePlay} disabled={!hasVideo} label={playing ? "Pause" : "Play"} primary>
                {playing ? <Pause className="size-6" aria-hidden /> : <Play className="size-6" aria-hidden />}
                <span className="text-xs">{playing ? "Pause" : "Play"}</span>
              </ControlButton>
              <ControlButton onClick={() => seekBy(10)} disabled={!hasVideo} label="Forward 10 seconds">
                <RotateCw className="size-6" aria-hidden />
                <span className="text-xs">+10s</span>
              </ControlButton>
            </div>

            <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
              <span>{formatTime(current)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Playback speed</h2>
            <span className="text-xl font-bold tabular-nums text-primary">{speed.toFixed(2)}x</span>
          </div>

          <input
            type="range"
            min={0.25}
            max={3}
            step={0.05}
            value={speed}
            aria-label="Playback speed"
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="speed-slider"
          />

          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSpeed(p)}
                className={`min-h-12 rounded-xl border text-sm font-semibold transition-colors ${
                  Math.abs(speed - p) < 0.001
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-secondary text-secondary-foreground"
                }`}
              >
                {p}x
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Your speed is remembered and reapplied to the next video.
          </p>
        </section>

        <p
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            status.kind === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : status.kind === "ok"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
          }`}
        >
          {status.kind === "error" && <AlertTriangle className="size-4 shrink-0" aria-hidden />}
          {status.text}
        </p>
      </div>
    </main>
  );
}

function ControlButton({
  children,
  onClick,
  disabled,
  label,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border transition-opacity active:opacity-70 disabled:opacity-40 ${
        primary
          ? "border-primary/50 bg-primary/20 text-primary"
          : "border-border bg-secondary text-secondary-foreground"
      }`}
    >
      {children}
    </button>
  );
}
