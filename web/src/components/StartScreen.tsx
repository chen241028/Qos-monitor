import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { Play, Copy, Sparkles, Flag, Compass } from "lucide-react";

const steps = [
  {
    title: "Draw cards",
    description: "Pick a rhythm for this run.",
    icon: Sparkles,
  },
  {
    title: "Race",
    description: "Feel the pace shift in real time.",
    icon: Flag,
  },
  {
    title: "Read the story",
    description: "See why the run behaved this way.",
    icon: Compass,
  },
];

export function StartScreen() {
  const startGame = useGameStore((state) => state.startGame);
  const [copied, setCopied] = useState(false);

  const seed = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const provided = params.get("seed");
    return provided ?? String(Date.now()).slice(-6);
  }, []);

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}?seed=${seed}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0A0A0F", minHeight: "100vh" }}
    >
      <div className="text-center max-w-3xl px-6">
        <h1
          className="text-6xl font-bold mb-4"
          style={{
            color: "#EEF2FF",
            textShadow: "0 0 10px rgba(79, 70, 229, 0.6)",
          }}
        >
          QoS Network Race
        </h1>

        <p className="text-xl mb-6 leading-relaxed" style={{ color: "#9CA3AF" }}>
          Experience network quality instead of reading raw numbers.
          <br />
          Use cards to feel rhythm, not just speed.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Icon className="h-4 w-4 text-slate-300" />
                  {step.title}
                </div>
                <div className="mt-2 text-xs text-slate-400">{step.description}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
            Rhythm first: smooth, wobble, pause — then the story.
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
            <span className="text-slate-500">Seed</span>
            <span className="font-mono text-slate-200">#{seed}</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-500 hover:text-slate-100"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            console.log("Button clicked, starting game...");
            startGame();
          }}
          className="mt-8 inline-flex items-center gap-3 rounded-xl bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_10px_30px_rgba(249,115,22,0.25)]"
        >
          <Play className="w-6 h-6" />
          Start Game
        </motion.button>

        <p className="text-sm mt-6" style={{ color: "#6B7280" }}>
          Each run lasts about 30 seconds. Watch the pace unfold.
        </p>
      </div>
    </div>
  );
}
