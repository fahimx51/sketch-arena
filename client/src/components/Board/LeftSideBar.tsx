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

    const getRankBadge = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black shadow-xs">
                        🥇
                    </span>
                );
            case 1:
                return (
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black shadow-xs">
                        🥈
                    </span>
                );
            case 2:
                return (
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-black shadow-xs">
                        🥉
                    </span>
                );
            default:
                return (
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400">
                        #{index + 1}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between h-full min-h-[460px]">
            <div>
                {/* Top Header */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <h2 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                            Leaderboard
                        </h2>
                    </div>

                    {roomCode && (
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/60">
                            Code: <strong className="text-slate-900 font-extrabold">{roomCode}</strong>
                        </span>
                    )}
                </div>

                {/* Players List */}
                <div className="flex flex-col gap-2">
                    {rankedPlayers.map((player, index) => (
                        <div
                            key={player.id}
                            className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 ${player.isDrawing
                                    ? "bg-amber-50/70 border-amber-300/80 shadow-xs ring-2 ring-amber-400/20"
                                    : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                {/* Rank Badge */}
                                <div className="shrink-0">{getRankBadge(index)}</div>

                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                                    {player.avatar}
                                </div>

                                {/* Name & Score */}
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-800 truncate">
                                        {player.name}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                        <span className="text-slate-700 font-extrabold">{player.score}</span> pts
                                    </span>
                                </div>
                            </div>

                            {/* Drawing Badge */}
                            {player.isDrawing && (
                                <div className="shrink-0 flex items-center gap-1.5 bg-amber-400/20 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300/50">
                                    <span className="animate-spin text-[10px]">✏️</span>
                                    <span>Drawing</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Role Switch Button */}
            <button
                type="button"
                onClick={onToggleRole}
                className="mt-4 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-xs transition-all duration-200 shadow-sm active:scale-[0.98] flex items-center justify-between cursor-pointer group"
            >
                <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                    Current Role
                </span>
                <span className="bg-slate-800 group-hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-700/60 transition-colors">
                    {isDrawer ? "🎨 Drawer" : "💬 Guesser"}
                </span>
            </button>
        </div>
    );
}