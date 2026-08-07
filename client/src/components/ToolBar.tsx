const COLORS = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ffffff"];
const BRUSH_SIZES = [2, 6, 12, 20];

interface ToolBarProps {
    color: string;
    brushSize: number;
    isEraser: boolean;
    onSelectColor: (color: string) => void;
    onSelectBrushSize: (size: number) => void;
    onToggleEraser: () => void;
    onClearCanvas: () => void;
}

export default function ToolBar({
    color,
    brushSize,
    isEraser,
    onSelectColor,
    onSelectBrushSize,
    onToggleEraser,
    onClearCanvas,
}: ToolBarProps) {
    return (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Colors */}
            <div className="flex items-center gap-1.5">
                {COLORS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onSelectColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer ${color === c && !isEraser
                            ? "border-slate-900 scale-110 shadow-xs"
                            : "border-slate-200 hover:scale-105"
                            }`}
                    />
                ))}
            </div>

            {/* Brush Sizes */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                {BRUSH_SIZES.map((size) => (
                    <button
                        key={size}
                        type="button"
                        onClick={() => onSelectBrushSize(size)}
                        className={`w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center transition-all cursor-pointer ${brushSize === size && !isEraser ? "bg-amber-100 ring-2 ring-[#F9D601]" : ""
                            }`}
                    >
                        <div
                            className="bg-slate-800 rounded-full"
                            style={{ width: size / 2 + 2, height: size / 2 + 2 }}
                        />
                    </button>
                ))}
            </div>

            {/* Eraser and Clear Actions */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button
                    type="button"
                    onClick={onToggleEraser}
                    className={`p-1.5 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${isEraser
                        ? "bg-[#F9D601] border-slate-900 text-slate-900"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                >
                    🧹 Eraser
                </button>

                <button
                    type="button"
                    onClick={onClearCanvas}
                    className="p-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl border border-red-200 font-bold text-xs transition-colors cursor-pointer"
                >
                    🗑️ Clear
                </button>
            </div>
        </div>
    );
}