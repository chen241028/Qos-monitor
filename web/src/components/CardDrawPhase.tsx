import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import type { Card } from "../types/game";

const RARITY_COLORS: Record<string, string> = {
    SSR: "from-amber-400 via-orange-400 to-rose-400",
    SR: "from-indigo-400 via-sky-400 to-indigo-300",
    R: "from-slate-400 via-cyan-400 to-slate-300",
};

const RARITY_STYLES: Record<string, string> = {
    SSR: "border-amber-300/60 shadow-[0_10px_25px_rgba(251,191,36,0.15)]",
    SR: "border-sky-300/50 shadow-[0_10px_25px_rgba(125,211,252,0.12)]",
    R: "border-slate-600/50 shadow-[0_10px_25px_rgba(148,163,184,0.08)]",
};

type Rarity = "SSR" | "SR" | "R";

type CategoryTag = {
    label: string;
    tone: string;
};

/**
 * Notes:
 * - We use the Card type to avoid eslint no-explicit-any warnings.
 * - Some sources may use different field names, so we read safely.
 */
function safeGetString(obj: unknown, keys: string[], fallback: string): string {
    if (!obj || typeof obj !== "object") return fallback;
    const rec = obj as Record<string, unknown>;
    for (const k of keys) {
        const v = rec[k];
        if (typeof v === "string" && v.trim().length > 0) return v;
    }
    return fallback;
}

function safeGetId(obj: unknown, keys: string[], fallback: string): string {
    if (!obj || typeof obj !== "object") return fallback;
    const rec = obj as Record<string, unknown>;
    for (const k of keys) {
        const v = rec[k];
        if (typeof v === "string" && v.trim().length > 0) return v;
        if (typeof v === "number") return String(v);
    }
    return fallback;
}

function getRarity(card: Card): Rarity {
    const r = safeGetString(card, ["rarity", "tier", "rank"], "R").toUpperCase();
    if (r === "SSR" || r === "SR" || r === "R") return r as Rarity;
    return "R";
}

function getTitle(card: Card): string {
    return safeGetString(card, ["name", "title"], "Mystery Card");
}

function getFlavor(card: Card): string {
    return safeGetString(
        card,
        ["flavor", "description", "effectText", "effect"],
        "A new rule joins this run."
    );
}

function getCategoryTag(card: Card): CategoryTag {
    switch (card.category) {
        case "bandwidth":
            return { label: "Smooth Pace", tone: "text-emerald-200 border-emerald-400/40" };
        case "latency":
            return { label: "Slow Start", tone: "text-amber-200 border-amber-400/40" };
        case "jitter":
            return { label: "Wobble", tone: "text-sky-200 border-sky-400/40" };
        case "packet-loss":
            return { label: "Hiccup", tone: "text-rose-200 border-rose-400/40" };
        case "special":
            return { label: "Surge", tone: "text-violet-200 border-violet-400/40" };
        default:
            return { label: "Rule", tone: "text-slate-200 border-slate-400/40" };
    }
}

function CardPattern({ card }: { card: Card }) {
    const tone = card.category;
    const stroke =
        tone === "bandwidth"
            ? "#34d399"
            : tone === "latency"
            ? "#f59e0b"
            : tone === "jitter"
            ? "#38bdf8"
            : tone === "packet-loss"
            ? "#fb7185"
            : "#a78bfa";

    if (tone === "bandwidth") {
        return (
            <svg viewBox="0 0 120 70" className="h-16 w-full">
                <path d="M5 50 Q30 30 55 40 T105 30" stroke={stroke} strokeWidth="3" fill="none" />
                <circle cx="20" cy="28" r="5" fill={stroke} opacity="0.4" />
                <circle cx="90" cy="20" r="7" fill={stroke} opacity="0.25" />
            </svg>
        );
    }

    if (tone === "latency") {
        return (
            <svg viewBox="0 0 120 70" className="h-16 w-full">
                <path d="M10 55 H45" stroke={stroke} strokeWidth="4" />
                <path d="M50 55 H95" stroke={stroke} strokeWidth="4" opacity="0.4" />
                <circle cx="25" cy="30" r="10" stroke={stroke} strokeWidth="3" fill="none" />
                <path d="M25 30 L25 18" stroke={stroke} strokeWidth="3" />
            </svg>
        );
    }

    if (tone === "jitter") {
        return (
            <svg viewBox="0 0 120 70" className="h-16 w-full">
                <polyline
                    points="5,40 20,30 35,45 50,28 65,42 80,32 95,38"
                    stroke={stroke}
                    strokeWidth="3"
                    fill="none"
                />
                <circle cx="80" cy="18" r="6" fill={stroke} opacity="0.35" />
            </svg>
        );
    }

    if (tone === "packet-loss") {
        return (
            <svg viewBox="0 0 120 70" className="h-16 w-full">
                <rect x="8" y="20" width="20" height="20" fill={stroke} opacity="0.35" />
                <rect x="42" y="20" width="20" height="20" fill={stroke} opacity="0.2" />
                <rect x="76" y="20" width="20" height="20" fill={stroke} opacity="0.5" />
                <path d="M30 55 H90" stroke={stroke} strokeWidth="3" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 120 70" className="h-16 w-full">
            <path d="M60 10 L75 45 L60 60 L45 45 Z" fill={stroke} opacity="0.4" />
            <path d="M20 50 L40 35" stroke={stroke} strokeWidth="3" />
            <path d="M80 50 L100 35" stroke={stroke} strokeWidth="3" />
        </svg>
    );
}

export function CardDrawPhase() {
    const userCards = useGameStore((state) => state.userCards);
    const drawUserCards = useGameStore((state) => state.drawUserCards);
    const startRace = useGameStore((state) => state.startRace);
    const [revealTick, setRevealTick] = useState(0);

    // Auto-draw if no cards were found (only on first mount).
    useEffect(() => {
        if (!userCards || userCards.length === 0) {
            console.log("No cards found, drawing cards in CardDrawPhase");
            drawUserCards();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if ((userCards?.length ?? 0) > 0) {
            setRevealTick(Date.now());
        }
    }, [userCards]);

    const canStart = useMemo(() => (userCards?.length ?? 0) >= 3, [userCards]);
    const cardSize = canStart ? "min-h-[220px]" : "min-h-[260px]";

    const handleDraw = () => {
        console.log("Drawing more cards");
        drawUserCards();
    };

    const handleStartRace = () => {
        if (!canStart) return;
        console.log("Starting race from CardDrawPhase");
        startRace();
    };

    return (
        <div className="relative min-h-[calc(100vh-0px)] overflow-hidden bg-slate-950 text-slate-50">
            <div className="mx-auto max-w-5xl px-6 py-10">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 ring-1 ring-slate-800">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-2xl font-semibold">Draw Your Rule Cards</div>
                        <div className="mt-1 text-sm text-slate-400">
                            This run uses your cards to shape the pace. Feel the experience first,
                            not the numbers.
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(userCards ?? []).map((card: Card, idx: number) => {
                        const rarity = getRarity(card);
                        const grad = RARITY_COLORS[rarity] ?? RARITY_COLORS.R;
                        const tag = getCategoryTag(card);

                        return (
                            <motion.div
                                key={`${safeGetId(card, ["id", "cardId", "uuid"], `${rarity}-${idx}`)}-${revealTick}`}
                                initial={{ opacity: 0, rotateY: 180, scale: 1.05, y: 18 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: idx * 0.08 }}
                                className={`relative overflow-hidden rounded-3xl border bg-slate-900/55 p-6 ${cardSize} ${
                                    RARITY_STYLES[rarity]
                                }`}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                <motion.div
                                    className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: "-120%" }}
                                    animate={{ x: "220%" }}
                                    transition={{ duration: 1.2, delay: idx * 0.12 }}
                                />

                                <div
                                    className="absolute inset-0 rounded-3xl border border-slate-800/60 bg-slate-950/80"
                                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                >
                                    <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${grad}`} />
                                    <div className="flex h-full flex-col items-center justify-center gap-3">
                                        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                            Network Deck
                                        </div>
                                        <div className="h-20 w-20 rounded-full border border-slate-700/70 bg-slate-900/70" />
                                        <div className="text-xs text-slate-500">Flip to reveal</div>
                                    </div>
                                </div>

                                <div
                                    className="relative"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${grad}`} />

                                    <div className="flex items-start justify-between gap-2 pt-2 text-xs text-slate-400">
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[11px] ${tag.tone}`}
                                        >
                                            {tag.label}
                                        </span>
                                        <span className="text-[10px] text-slate-500/80">#{idx + 1}</span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-lg font-semibold text-slate-100">
                                            {getTitle(card)}
                                        </div>
                                        <div className="rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-0.5 text-[11px] tracking-wide text-slate-300">
                                            {rarity}
                                        </div>
                                    </div>

                                    <div className="mt-3 text-sm leading-relaxed text-slate-300">
                                        {getFlavor(card)}
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-3">
                                        <CardPattern card={card} />
                                    </div>

                                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-slate-200/5 blur-2xl" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {(userCards?.length ?? 0) === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-6 text-sm text-slate-400 sm:col-span-2 lg:col-span-3">
                            Preparing cards... (if this takes too long, click "Draw Again")
                        </div>
                    ) : null}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleDraw}
                        className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900/60"
                    >
                        Draw Again
                    </button>

                    <button
                        type="button"
                        onClick={handleStartRace}
                        disabled={!canStart}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Start Race
                    </button>

                    <div className="text-sm text-slate-400">
                        You have drawn{" "}
                        <span className="font-mono text-slate-200">
                            {userCards?.length ?? 0}
                        </span>{" "}
                        cards{canStart ? ", ready to race." : ", need at least 3 to start."}
                    </div>
                </div>
            </div>
        </div>
    );
}
