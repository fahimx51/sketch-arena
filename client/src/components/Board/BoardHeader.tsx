interface BoardHeaderProps {
    currentWord: string;
    timer: number;
}

export default function BoardHeader({ currentWord, timer }: BoardHeaderProps) {
    return (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase">
                    Word:
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-widest">
                    {currentWord}
                </span>
            </div>

            <div className="flex items-center gap-2 bg-amber-100 border border-[#F9D601] px-3 py-1 rounded-xl">
                <span className="text-xs">⏳</span>
                <span className="text-base font-black text-slate-900">{timer}s</span>
            </div>
        </div>
    );
}