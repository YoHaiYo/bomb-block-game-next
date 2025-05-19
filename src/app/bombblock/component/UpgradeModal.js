// ./component/UpgradeModal.jsx

import React from "react";

export default function UpgradeModal({
  show,
  bombPower,
  bombDamage,
  perforation,
  selectedUpgrade,
  setSelectedUpgrade,
  handleConfirmUpgrade,
}) {
  if (!show) return null;

  const upgradeOptions = [
    {
      type: "range",
      icon: "🔥",
      title: "Bomb Range +1",
      description: "Increase how far the explosion range.",
      bg: "from-yellow-300 to-yellow-500",
      border: "border-yellow-600",
      ring: "hover:ring-yellow-300",
      text: "text-gray-900",
      shadow: "bg-yellow-600",
    },
    {
      type: "damage",
      icon: "💥",
      title: "Bomb Damage +1",
      description: "Increase how much damage is dealt to blocks.",
      bg: "from-red-400 to-red-600",
      border: "border-red-700",
      ring: "hover:ring-red-300",
      text: "text-white",
      shadow: "bg-red-800",
    },
    {
      type: "penetrate",
      icon: "🧿",
      title: "Perforation +1",
      description: "Break through more blocks per direction.",
      bg: "from-cyan-400 to-blue-600",
      border: "border-blue-700",
      ring: "hover:ring-cyan-300",
      text: "text-white",
      shadow: "bg-blue-800",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-50 px-4 overflow-y-auto">
      <div className="h-screen flex items-center justify-center max-w-4xl w-full max-h-screen overflow-y-auto bg-transparent">
        <div className="p-4">
          <h2 className="text-center text-white text-xl font-bold mb-6 font-mono">
            Choose an Upgrade Card!
          </h2>
          <div className="text-center text-sm sm:text-base text-white font-mono mb-4">
            [Current Stats] 🔥Range:{" "}
            <span className="text-lime-200 font-bold">{bombPower}</span>,
            💥Damage:{" "}
            <span className="text-lime-200 font-bold">{bombDamage}</span>,
            🧿Penetration:{" "}
            <span className="text-lime-200 font-bold">{perforation}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            {upgradeOptions.map((opt) => (
              <div
                key={opt.type}
                onClick={() => setSelectedUpgrade(opt.type)}
                className={`${
                  selectedUpgrade === opt.type
                    ? "ring-4 ring-green-300 scale-105"
                    : ""
                } cursor-pointer w-full sm:w-60 bg-gradient-to-b ${opt.bg} ${
                  opt.border
                } p-4 shadow-xl text-center font-mono hover:scale-105 ${
                  opt.ring
                } transition-transform`}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-2">{opt.icon}</div>
                  <h3 className={`text-lg font-bold ${opt.text}`}>
                    {opt.title}
                  </h3>
                </div>
                <p className={`text-sm ${opt.text} mt-1`}>{opt.description}</p>
                <div
                  className={`mt-4 ${opt.shadow} text-white px-3 py-1 shadow pointer-events-none`}
                >
                  Choose
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              className={`px-6 py-2 font-bold text-white bg-green-500 hover:bg-green-600 transition ${
                selectedUpgrade ? "" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleConfirmUpgrade}
              disabled={!selectedUpgrade}
            >
              Confirm Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
