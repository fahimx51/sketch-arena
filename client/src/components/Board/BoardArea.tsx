import React, { useRef, useState } from "react";
import HeaderBar from "./BoardHeader";
import ToolBar from "../ToolBar";

interface BoardAreaProps {
    currentWord: string;
    timer: number;
    isDrawer: boolean;
}

export default function BoardArea({
    currentWord,
    timer,
    isDrawer,
}: BoardAreaProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(6);
    const [isEraser, setIsEraser] = useState(false);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawer) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isDrawer) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = isEraser ? "#ffffff" : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="flex flex-col gap-3 ">
            {/* 1. Word & Timer Component */}
            <HeaderBar
                currentWord={currentWord}
                timer={timer}
                isDrawer={isDrawer}
            />

            {/* 2. Drawing Canvas */}
            <div className="relative bg-white rounded-3xl shadow-md overflow-hidden h-full flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className={`w-full h-full bg-yellow-400/20 ${isDrawer ? "cursor-crosshair" : "cursor-not-allowed"
                        }`}
                />

                {!isDrawer && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                        Guess the drawing in the chat! 👇
                    </div>
                )}
            </div>

            {/* 3. Color & Pen Controls Component */}
            {isDrawer && (
                <ToolBar
                    color={color}
                    brushSize={brushSize}
                    isEraser={isEraser}
                    onSelectColor={(selectedColor) => {
                        setColor(selectedColor);
                        setIsEraser(false);
                    }}
                    onSelectBrushSize={(selectedSize) => setBrushSize(selectedSize)}
                    onToggleEraser={() => setIsEraser(!isEraser)}
                    onClearCanvas={handleClearCanvas}
                />
            )}
        </div>
    );
}