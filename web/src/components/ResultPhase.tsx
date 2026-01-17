import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { Trophy, X, Minus } from "lucide-react";

export function ResultPhase() {
  const result = useGameStore((state) => state.result);

  if (!result) {
    return (
      <div
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "#0A0A0F", color: "#EEF2FF" }}
      >
        <p className="text-xl">Loading race result...</p>
      </div>
    );
  }

  const isWin = result.winner === "user";
  const isDraw = result.difference < 2;

  const analysis = result.analysis;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#0A0A0F" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          {isWin ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-4xl font-bold text-glow mb-2">You Win!</h2>
              <p className="text-xl text-gray-400">Your network performed excellently</p>
            </motion.div>
          ) : isDraw ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Minus className="w-24 h-24 mx-auto mb-4 text-gray-500" />
              <h2 className="text-4xl font-bold text-glow mb-2">Neck and Neck</h2>
              <p className="text-xl text-gray-400">The gap is tiny. Tight race.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <X className="w-24 h-24 mx-auto mb-4 text-red-500" />
              <h2 className="text-4xl font-bold text-glow mb-2">Close Loss</h2>
              <p className="text-xl text-gray-400">
                Gap: {result.difference.toFixed(1)}%
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold mb-4">Performance Analysis</h3>

          {analysis && analysis.strengths && analysis.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {analysis.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis && analysis.limitations && analysis.limitations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-yellow-400 font-semibold mb-2">Limitations</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {analysis.limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis && analysis.improvements && analysis.improvements.length > 0 && (
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Improvements</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {analysis.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => {
              useGameStore.getState().reset();
              useGameStore.getState().startGame();
            }}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors duration-200"
          >
            Restart
          </button>
          <button
            onClick={() => {
              useGameStore.getState().startGame();
            }}
            className="bg-cta hover:bg-cta/90 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors duration-200"
          >
            New Run
          </button>
        </motion.div>
      </div>
    </div>
  );
}
