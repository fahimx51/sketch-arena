import React, { useEffect, useRef } from "react";
import type { ChatMessage } from "../../store/useGameStore";

interface RightSideBarProps {
    chatLog: ChatMessage[];
    guessInput: string;
    isDrawer: boolean;
    onGuessChange: (val: string) => void;
    onSendChat: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function RightSideBar({
    chatLog,
    guessInput,
    isDrawer,
    onGuessChange,
    onSendChat,
}: RightSideBarProps) {
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLog]);

    return (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-[480px] lg:h-full">
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wider mb-2 pb-2 border-b border-slate-100">
                Guesses & Chat
            </h2>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 text-xs scroll-smooth">
                {chatLog.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        className={`p-2.5 rounded-xl transition-all ${msg.isCorrect
                            ? "bg-green-100 text-green-900 font-bold border border-green-200 text-center shadow-xs"
                            : msg.isSystem
                                ? "bg-amber-50 text-amber-800 font-semibold text-center italic border border-amber-100"
                                : "bg-slate-50 text-slate-800 border border-slate-100"
                            }`}
                    >
                        {!msg.isSystem && !msg.isCorrect && (
                            <span className="font-extrabold text-slate-900 mr-1.5">
                                {msg.sender}:
                            </span>
                        )}
                        <span>{msg.text}</span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={onSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                    type="text"
                    disabled={isDrawer}
                    placeholder={isDrawer ? "You are drawing..." : "Type your guess here..."}
                    value={guessInput}
                    onChange={(e) => onGuessChange(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F9D601] disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                />
                <button
                    type="submit"
                    disabled={isDrawer || !guessInput.trim()}
                    className="bg-[#F9D601] hover:bg-[#ffe12c] text-slate-900 px-4 py-2 rounded-xl font-extrabold text-xs border-b-2 border-r-2 border-[#DDAF02] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:border-transparent"
                >
                    Send
                </button>
            </form>
        </div>
    );
}