import { useState } from "react";
import { Outlet } from "react-router";
import Logo from "../components/Logo";

export default function MainLayout() {
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    return (
        <div className="min-h-screen bg-amber-50 text-slate-800 flex flex-col justify-between p-4 sm:p-6 font-mono selection:bg-yellow-300">
            {/* Top Navbar */}
            <header className="flex justify-between items-center max-w-6xl mx-auto w-full mb-4 sm:mb-6">
                <Logo />

                <button
                    onClick={() => setShowHowToPlay(true)}
                    aria-label="How to play"
                    className="w-10 h-10 bg-pink-500 hover:bg-pink-400 text-white font-black text-xl rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center cursor-pointer"
                >
                    ?
                </button>
            </header>

            {/* Main Content View (Home / GameRoom) */}
            <main className="flex-1 max-w-6xl mx-auto w-full flex flex-col justify-center items-center py-2">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="text-center text-xs font-bold text-slate-500 mt-6 pt-4 border-t-2 border-black/10 max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>SketchArena • Real-Time Canvas Game</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded border border-black/20">
                    v1.0.0
                </span>
            </footer>

            {/* How To Play Modal */}
            {showHowToPlay && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                            <h2 className="text-2xl font-black uppercase tracking-tight">
                                How to Play 🎨
                            </h2>
                            <button
                                onClick={() => setShowHowToPlay(false)}
                                className="font-black text-xl hover:text-red-500 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <ol className="list-decimal list-inside space-y-2 text-sm font-sans font-semibold text-slate-700 mb-6">
                            <li>Join a room or create a private game with friends.</li>
                            <li>When it is your turn, pick a word and draw it on the canvas!</li>
                            <li>When other players are drawing, guess the word in the live chat.</li>
                            <li>Earn points based on speed and accuracy to win the match!</li>
                        </ol>

                        <button
                            onClick={() => setShowHowToPlay(false)}
                            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}