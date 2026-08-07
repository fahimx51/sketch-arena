// src/pages/Home.tsx
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12 font-mono">
      {/* Quick, Draw! Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-6xl font-black tracking-wider text-slate-900 uppercase mb-4">
          SKETCH ARENA
        </h1>
        <p className="text-base sm:text-lg text-slate-700 font-semibold max-w-md mx-auto">
          Can a neural network learn to recognize doodling?
        </p>
      </div>

      {/* 3D Yellow Button (Replicating Quick, Draw! Style using Tailwind CSS) */}
      <div className="relative inline-block mt-4">
        {/* Light Gray Cast Shadow */}
        <div className="absolute inset-0 bg-slate-200 translate-x-2 translate-y-2 rounded-xs" />

        {/* Button Surface & 3D Edges */}
        <button
          onClick={() => navigate("/join")}
          className="relative bg-[#F9D601] hover:bg-[#ffe12c] text-white text-xl tracking-wider font-semibold px-10 py-3 rounded-xs border-b-6 border-r-6 border-[#e0d208] active:translate-x-1 active:translate-y-1 active:border-b-2 active:border-r-2 transition-all cursor-pointer"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
}