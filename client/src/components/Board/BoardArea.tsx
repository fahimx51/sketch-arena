import React, { useRef, useState, useEffect } from "react";
import HeaderBar from "./BoardHeader";
import ToolBar from "../ToolBar";
import { useGameStore } from "../../store/useGameStore";
import type { DrawStep } from "../../types";

interface BoardAreaProps {
    currentWord: string;
    maskedHint: string;
    timer: number;
    isDrawer: boolean;
    wordChoices?: string[];
    onSelectWord?: (word: string) => void;
}

export default function BoardArea({
    isDrawer,
    wordChoices = [],
    onSelectWord,
}: BoardAreaProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(6);
    const [isEraser, setIsEraser] = useState(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const { emitDrawLine, emitClearCanvas, room } = useGameStore();

    // Re-render canvas lines from room canvasHistory state
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        room?.canvasHistory?.forEach((step: DrawStep) => {
            ctx.beginPath();
            ctx.moveTo(step.prevX, step.prevY);
            ctx.lineTo(step.currentX, step.currentY);
            ctx.strokeStyle = step.color;
            ctx.lineWidth = step.brushSize;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
        });
    }, [room?.canvasHistory]);

    // Display logic: Drawer sees full word, Guesser sees hint

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawer) return;
        setIsDrawing(true);
        lastPos.current = getCanvasCoordinates(e);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isDrawer || !lastPos.current) return;

        const currentPos = getCanvasCoordinates(e);
        const drawData: DrawStep = {
            prevX: lastPos.current.x,
            prevY: lastPos.current.y,
            currentX: currentPos.x,
            currentY: currentPos.y,
            color: isEraser ? "#ffffff" : color,
            brushSize,
        };

        emitDrawLine(drawData);
        lastPos.current = currentPos;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPos.current = null;
    };

    return (
        <div className="flex flex-col gap-3 relative">
            {/* Word Selection Modal for Drawer */}
            {isDrawer && wordChoices.length > 0 && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 rounded-3xl">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full text-center border-2 border-slate-100">
                        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                            Choose a Word
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 mb-6">
                            Pick one word to draw for this round
                        </p>

                        <div className="grid grid-cols-1 gap-2.5">
                            {wordChoices.map((word) => (
                                <button
                                    key={word}
                                    onClick={() => onSelectWord?.(word)}
                                    className="bg-amber-50 hover:bg-[#F9D601] text-slate-900 font-extrabold py-3 px-4 rounded-2xl border-2 border-amber-200 hover:border-[#DDAF02] transition-all cursor-pointer text-sm shadow-xs active:scale-98"
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <HeaderBar />

            {/* Canvas Container */}
            <div className="relative bg-white rounded-3xl shadow-md overflow-hidden h-full flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className={`w-full h-full bg-slate-50 ${isDrawer ? "cursor-crosshair" : "cursor-not-allowed"
                        }`}
                />

                {!isDrawer && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                        Type your guess in the chat! 👇
                    </div>
                )}
            </div>

            {/* Drawer ToolBar */}
            {isDrawer && (
                <ToolBar
                    color={color}
                    brushSize={brushSize}
                    isEraser={isEraser}
                    onSelectColor={(selectedColor) => {
                        setColor(selectedColor);
                        setIsEraser(false);
                    }}
                    onSelectBrushSize={setBrushSize}
                    onToggleEraser={() => setIsEraser(!isEraser)}
                    onClearCanvas={emitClearCanvas}
                />
            )}
        </div>
    );
}