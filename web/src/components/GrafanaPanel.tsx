import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import {
  buildGlobalBaseline,
  buildYourRhythm,
  summarizeTelemetry,
  type TelemetryEvent,
} from "../utils/telemetry";
import type { ActiveEffect, Card } from "../types/game";

interface GrafanaPanelProps {
  url?: string;
}

const SEGMENTS = 12;

export function GrafanaPanel({}: GrafanaPanelProps) {
  const raceState = useGameStore((state) => state.raceState);

  const duration = raceState?.duration ?? 30000;
  const elapsed = raceState?.elapsedTime ?? 0;
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  const runId = raceState?.runId ?? 1;
  const events = (raceState?.events ?? []) as TelemetryEvent[];
  const feel = pickFeel(raceState?.effects?.user ?? []);
  const userCards =
    raceState?.participants?.find((p) => p.id === "user")?.cards ?? ([] as Card[]);

  const baseline = useMemo(
    () => buildGlobalBaseline(duration, SEGMENTS, runId),
    [duration, runId]
  );

  const yourRhythm = useMemo(
    () => buildYourRhythm(duration, SEGMENTS, events),
    [duration, events]
  );

  const summary = useMemo(
    () => summarizeTelemetry(events, elapsed, userCards),
    [events, elapsed, userCards]
  );

  const timelineEvents = events.slice(-8).reverse();

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Telemetry
            </div>
            <div className="mt-2 text-xl font-semibold text-slate-100">Run Panel</div>
            <div className="mt-1 text-xs text-slate-500">Seed #{runId}</div>
          </div>
          <FeelIndicator feel={feel} />
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-200">Rhythm Overview</div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Global Baseline</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-slate-500/70"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Your Network</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-slate-100/70"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-200">Smooth vs Stutter</div>
          <div className="space-y-3">
            <div className="text-xs text-slate-500">Global Baseline</div>
            <div className="grid grid-cols-12 gap-1">
              {baseline.map((segment) => (
                <div
                  key={`global-${segment.index}`}
                  className="h-6 rounded-sm"
                  style={{
                    backgroundColor: `rgba(148, 163, 184, ${segment.smoothness})`,
                  }}
                />
              ))}
            </div>

            <div className="text-xs text-slate-500">Your Network</div>
            <div className="grid grid-cols-12 gap-1">
              {yourRhythm.map((segment) => (
                <div
                  key={`you-${segment.index}`}
                  className="h-6 rounded-sm"
                  style={{
                    backgroundColor: `rgba(226, 232, 240, ${segment.smoothness})`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-200">Event Timeline</div>
          <div className="space-y-2 text-xs text-slate-400">
            {timelineEvents.length === 0 ? (
              <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                Waiting for the first event...
              </div>
            ) : (
              timelineEvents.map((event) => (
                <div
                  key={`${event.timeMs}-${event.message}`}
                  className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-900/60 p-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <div>
                    <div className="text-slate-300">
                      {formatTime(event.timeMs)} · {event.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold text-slate-200">Live Explanation</div>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
              {summary.nowText}
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
              {summary.trendText}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatTime(timeMs: number): string {
  const seconds = Math.floor(timeMs / 1000);
  const ms = Math.floor((timeMs % 1000) / 100);
  return `${seconds}.${ms}s`;
}

function pickFeel(effects: ActiveEffect[]) {
  if (effects.some((effect) => effect.type === "stall" || effect.type === "drop")) {
    return "pause";
  }
  if (effects.some((effect) => effect.type === "jitter")) {
    return "jitter";
  }
  if (effects.some((effect) => effect.type === "surge")) {
    return "surge";
  }
  return "smooth";
}

function FeelIndicator(props: { feel: "smooth" | "jitter" | "pause" | "surge" }) {
  const label =
    props.feel === "pause"
      ? "Paused"
      : props.feel === "jitter"
      ? "Jitter"
      : props.feel === "surge"
      ? "Surge"
      : "Smooth";

  const dotClass =
    props.feel === "pause"
      ? "bg-rose-400"
      : props.feel === "jitter"
      ? "bg-sky-300"
      : props.feel === "surge"
      ? "bg-emerald-400"
      : "bg-slate-300";

  const motionProps =
    props.feel === "pause"
      ? { opacity: [1, 0.4, 1], scale: [1, 0.95, 1] }
      : props.feel === "jitter"
      ? { x: [0, -2, 2, 0], opacity: [0.8, 1, 0.8] }
      : props.feel === "surge"
      ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
      : { opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] };

  return (
    <div className="flex flex-col items-end gap-2 text-xs text-slate-400">
      <div className="uppercase tracking-[0.2em] text-[10px]">Feel</div>
      <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1">
        <motion.span
          animate={motionProps}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className={`h-2 w-2 rounded-full ${dotClass}`}
        />
        <span className="text-slate-200">{label}</span>
      </div>
    </div>
  );
}
