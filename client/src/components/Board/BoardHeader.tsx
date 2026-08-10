// components/HeaderBar.tsx
import React from "react";import { socket, useGameStore } from "../../store/useGameStore";
;

export default function HeaderBar() {
    const { room, timer, maskedHint, revealedWord } = useGameStore();

    // Check if current user is the drawer
    const myPlayer = room?.players.find((p) => p.id === socket.id);
    const isDrawer = myPlayer?.isDrawing || false;

    // Display Priority:
    // 1. Drawer -> sees room.currentWord
    // 2. Player who guessed correctly -> sees revealedWord ("APPLE")
    // 3. Player still guessing -> sees maskedHint ("A P _ _ E")
    const displayWord = isDrawer
        ? room?.currentWord
        : revealedWord
            ? revealedWord
            : maskedHint || "_ _ _ _";

    return (
        <div className="flex justify-between items-center bg-slate-900 text-white px-6 py-3 rounded-2xl mb-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
                <span className="text-xl">⏳</span>
                <span className="font-bold text-lg">{timer}s</span>
            </div>

            {/* Word Display */}
            <div className="text-xl font-mono tracking-widest uppercase font-black text-amber-400">
                {displayWord}
            </div>

            {/* Guessed Status Badge */}
            <div>
                {revealedWord && !isDrawer && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold">
                        Guessed! 🎉
                    </span>
                )}
            </div>
        </div>
    );
}