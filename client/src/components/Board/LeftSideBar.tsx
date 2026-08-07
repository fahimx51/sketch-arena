interface Player {
    id: string;
    name: string;
    avatar: string;
    score: number;
    isDrawing: boolean;
}

interface LeftSideBarProps {
    players: Player[];
    roomCode?: string;
    isDrawer: boolean;
    onToggleRole: () => void;
}

export default function LeftSideBar({
    players,
    roomCode,
    isDrawer,
    onToggleRole,
}: LeftSideBarProps) {
    const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wider">
                        Leaderboard
                    </h2>
                    <span className="text-xs font-bold bg-amber-100 text-slate-800 px-2 py-0.5 rounded-full">
                        Code: {roomCode}
                    </span>
                </div>

                <div className="flex flex-col gap-2.5">
                    {rankedPlayers.map((player, index) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${player.isDrawing
                                ? "bg-amber-50 border-[#F9D601] ring-2 ring-[#F9D601]/40"
                                : "bg-slate-50 border-slate-100"
                                }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-black text-slate-400 w-4">
                                    #{index + 1}
                                </span>
                                <span className="text-2xl">{player.avatar}</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                        {player.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        {player.score} pts
                                    </span>
                                </div>
                            </div>

                            {player.isDrawing && (
                                <span className="text-[10px] bg-[#F9D601] text-slate-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                                    ✏️
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={onToggleRole}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
                Role: {isDrawer ? "Drawer 🎨" : "Guesser 💬"}
            </button>
        </div>
    );
}