import { useGameStore } from "./store/gameStore";
import { StartScreen } from "./components/StartScreen";
import { CardDrawPhase } from "./components/CardDrawPhase";
import { RacePhase } from "./components/RacePhase";
import { ResultPhase } from "./components/ResultPhase";
import { GrafanaPanel } from "./components/GrafanaPanel";

export default function App() {
    const phase = useGameStore((state) => state.phase);

    // Hide Grafana on the start screen to keep focus on the intro.
    const showGrafana = phase !== "start";

    const renderPhaseContent = () => {
        switch (phase) {
            case "start":
                return <StartScreen />;

            case "card-draw":
                return <CardDrawPhase />;

            case "race":
                return <RacePhase />;

            case "result":
                return <ResultPhase />;

            default:
                // Never show a blank screen for unknown states.
                return (
                    <div className="p-6">
                        <div className="text-2xl font-semibold">Loading...</div>
                        <div className="mt-2 text-sm text-slate-400">
                            Current phase: <span className="font-mono">{String(phase)}</span>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <div className="mx-auto flex min-h-screen max-w-[1400px]">
                <main className="flex-1 overflow-hidden">{renderPhaseContent()}</main>

                {showGrafana ? (
                    <aside className="hidden w-[420px] shrink-0 border-l border-slate-800 bg-slate-950/60 lg:block">
                        <GrafanaPanel />
                    </aside>
                ) : null}
            </div>
        </div>
    );
}
