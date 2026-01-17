import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { simulateRaceStep } from "../utils/raceSimulator";
import { generateAnalysis } from "../utils/analysis";
import type { RaceState, RaceEventType, ActiveEffect } from "../types/game";

export function RacePhase() {
    const raceState = useGameStore((state) => state.raceState);
    const userCards = useGameStore((state) => state.userCards);
    const updateRace = useGameStore((state) => state.updateRace);
    const endRace = useGameStore((state) => state.endRace);

    const animationFrameRef = useRef<number | null>(null);
    const lastFrameRef = useRef<number | null>(null);
    const raceStateRef = useRef<RaceState | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const duration = raceState?.duration ?? 30_000;
    const raceReady = raceState !== null;

    useEffect(() => {
        raceStateRef.current = raceState;
    }, [raceState]);

    const progress = useMemo(() => {
        if (!raceState) return 0;
        return Math.max(0, Math.min(1, raceState.elapsedTime / duration));
    }, [raceState, duration]);

    useEffect(() => {
        // Guard: if raceState is missing, we haven't initialized yet.
        if (!raceState) {
            return;
        }

        lastFrameRef.current = null;
        startTimeRef.current = null;

        const tick = (now: number) => {
            try {
                const current = raceStateRef.current;
                if (!current) {
                    animationFrameRef.current = requestAnimationFrame(tick);
                    return;
                }

                if (startTimeRef.current == null) {
                    startTimeRef.current = now;
                }

                const desiredElapsed = Math.min(duration, now - startTimeRef.current);
                const last = lastFrameRef.current ?? now;
                const rawDelta = Math.max(0, now - last);
                const elapsedDelta = Math.max(0, desiredElapsed - current.elapsedTime);
                const delta = Math.min(rawDelta, 50, elapsedDelta);
                lastFrameRef.current = now;

                // 1) Let the simulator produce the next state.
                const next = simulateRaceStep(current, delta);

                // 2) Store update.
                updateRace(next);

                // 3) Completion check.
                const done = next.elapsedTime >= duration;

                if (done) {
                    // Generate analysis (fallback if it throws).
                    let analysis: ReturnType<typeof generateAnalysis>;
                    try {
                        const participants = next.participants ?? [];
                        const user = participants.find((p) => p.id === "user");
                        const opponent = participants.find((p) => p.id === "opponent");

                        const userPos = user?.position ?? 0;
                        const opponentPos = opponent?.position ?? 0;
                        const analysisCards =
                            user?.cards && user.cards.length > 0
                                ? user.cards
                                : userCards;


                        analysis = generateAnalysis(analysisCards, userPos, opponentPos);
                    } catch {
                        analysis = {
                            strengths: ["Run completed"],
                            limitations: ["Analysis module is temporarily unavailable"],
                            improvements: ["Refine narrative rules and feedback next"],
                        };
                    }

                    // Compute winner/difference from positions.
                    const participants = next.participants ?? [];
                    const user = participants.find((p) => p.id === "user");
                    const opponent = participants.find((p) => p.id === "opponent");
                    const userPos = user?.position ?? 0;
                    const opponentPos = opponent?.position ?? 0;
                    const difference = Math.abs(userPos - opponentPos);
                    const winner =
                        difference < 2 ? "close" : userPos > opponentPos ? "user" : "opponent";

                    const result = {
                        winner,
                        userPosition: userPos,
                        difference,
                        analysis,
                    };

                    endRace(result);
                    return;
                }
            } catch (e) {
                // Simulator fallback to avoid blank screen.
                console.error("RacePhase tick error:", e);

                endRace({
                    winner: "close",
                    difference: 0,
                    userPosition: 0,
                    analysis: {
                        strengths: [],
                        limitations: ["The race engine encountered an error and exited"],
                        improvements: ["Check raceSimulator and data shapes"],
                    },
                });

                return;
            }

            animationFrameRef.current = requestAnimationFrame(tick);
        };

        animationFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (animationFrameRef.current != null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = null;
            lastFrameRef.current = null;
            startTimeRef.current = null;
        };
        // Only start loop once after entering the race phase.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [raceReady]);

    // Never render a blank screen.
    if (!raceState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
                <div className="text-center">
                    <div className="text-xl font-semibold">Initializing race...</div>
                    <div className="mt-2 text-sm text-slate-400">
                        If it stays here, raceState was not created properly.
                    </div>
                </div>
            </div>
        );
    }

    const events = raceState.events ?? [];
    const recentEvents = events.slice(-6).reverse();

    // Participant info with fallbacks.
    const participants = (raceState as any)?.participants ?? [];
    const user = participants.find((p: any) => p?.id === "user") ?? participants[0];
    const opponent =
        participants.find((p: any) => p?.id === "opponent") ?? participants[1];

    const userPos = (user as any)?.position ?? progress * 100;
    const oppPos = (opponent as any)?.position ?? progress * 98;

    const effects = raceState.effects ?? {};
    const userEffect = pickActiveEffect(effects[user?.id ?? "user"]);
    const opponentEffect = pickActiveEffect(effects[opponent?.id ?? "opponent"]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="text-2xl font-semibold">Race in Progress</div>
                        <div className="mt-1 text-sm text-slate-400">
                            Rules are active: smooth = steady pace, jitter = broken rhythm.
                        </div>
                    </div>
                    <div className="text-sm text-slate-300">{Math.round(progress * 100)}%</div>
                </div>

                <div className="mt-6 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full bg-slate-100"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-5">
                        <Lane
                            label={(user as any)?.name ?? "Your Network"}
                            value={userPos}
                            effect={userEffect}
                        />
                        <Lane
                            label={(opponent as any)?.name ?? "Opponent Network"}
                            value={oppPos}
                            effect={opponentEffect}
                        />
                    </div>

                    <EventLog events={recentEvents} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
                >
                    <div className="text-sm text-slate-300">
                        Narrator: This is a 30-second sprint. Your cards affect rhythm, not raw numbers.
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function pickActiveEffect(effects?: ActiveEffect[]) {
    if (!effects || effects.length === 0) return null;
    const priority = ["drop", "stall", "jitter", "surge"] as RaceEventType[];
    for (const type of priority) {
        const effect = effects.find((item) => item.type === type);
        if (effect) return effect;
    }
    return effects[0] ?? null;
}

function getEffectLabel(type: RaceEventType): string {
    switch (type) {
        case "drop":
            return "Packet detour";
        case "stall":
            return "Response delay";
        case "jitter":
            return "Rhythm jitter";
        case "surge":
            return "Sudden boost";
        default:
            return "";
    }
}

function getEffectTone(type: RaceEventType): string {
    switch (type) {
        case "drop":
            return "bg-red-500/20 text-red-200 border-red-500/40";
        case "stall":
            return "bg-yellow-500/20 text-yellow-200 border-yellow-500/40";
        case "jitter":
            return "bg-sky-500/20 text-sky-200 border-sky-500/40";
        case "surge":
            return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
        default:
            return "bg-slate-500/20 text-slate-200 border-slate-500/40";
    }
}

function getEffectDot(type: RaceEventType): string {
    switch (type) {
        case "drop":
            return "bg-red-400";
        case "stall":
            return "bg-yellow-400";
        case "jitter":
            return "bg-sky-300";
        case "surge":
            return "bg-emerald-400";
        default:
            return "bg-slate-200";
    }
}

function Lane(props: { label: string; value: number; effect: ActiveEffect | null }) {
    const pct = Math.max(0, Math.min(100, props.value));
    const effectType = props.effect?.type;

    return (
        <div>
            <div className="flex items-center justify-between text-sm gap-3">
                <div className="flex items-center gap-2">
                    <div className="font-semibold">{props.label}</div>
                    {effectType ? (
                        <span
                            className={`rounded-full border px-2 py-0.5 text-xs ${getEffectTone(effectType)}`}
                        >
                            {getEffectLabel(effectType)}
                        </span>
                    ) : null}
                </div>
                <div className="text-slate-400">{Math.round(pct)}%</div>
            </div>

            <div className="mt-2 h-10 rounded-xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-slate-100/15"
                    style={{ width: `${pct}%` }}
                />
                <div
                    className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full ${
                        effectType ? getEffectDot(effectType) : "bg-slate-100"
                    }`}
                    style={{ left: `calc(${pct}% - 12px)` }}
                />
            </div>
        </div>
    );
}

function EventLog(props: { events: { id: string; timeMs: number; message: string }[] }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="text-sm font-semibold text-slate-200">Event Feed</div>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
                {props.events.length === 0 ? (
                    <div className="text-slate-500">Waiting for the first event...</div>
                ) : (
                    props.events.map((event) => (
                        <div key={event.id} className="flex gap-2">
                            <div className="w-10 shrink-0 text-slate-500">
                                {formatTime(event.timeMs)}
                            </div>
                            <div>{event.message}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function formatTime(timeMs: number): string {
    const seconds = Math.floor(timeMs / 1000);
    const ms = Math.floor((timeMs % 1000) / 100);
    return `${seconds}.${ms}s`;
}
