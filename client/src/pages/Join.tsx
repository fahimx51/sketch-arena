import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useGameStore } from "../store/useGameStore";

const AVATARS = ["🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐵", "🦄"];

const GAME_MODES = [
    { id: "random", label: "Public Match", icon: "🎲", desc: "Join any open room" },
    { id: "create", label: "Private Room", icon: "🔒", desc: "Play with friends" },
    { id: "code", label: "Room Code", icon: "🔑", desc: "Enter invite code" },
    { id: "bot", label: "Bot Practice", icon: "🤖", desc: "Train on your own" },
] as const;

export default function Join() {
    const [name, setName] = useState("");
    const [avatarIndex, setAvatarIndex] = useState(0);
    const [roomCodeInput, setRoomCodeInput] = useState("");
    const [activeTab, setActiveTab] = useState<"random" | "create" | "code" | "bot">("random");

    const navigate = useNavigate();

    // Zustand Selectors
    const isConnected = useGameStore((state) => state.isConnected);
    const errorMessage = useGameStore((state) => state.errorMessage);
    const createPrivateRoom = useGameStore((state) => state.createPrivateRoom);
    const joinPublicRoom = useGameStore((state) => state.joinPublicRoom);
    const joinPrivateRoom = useGameStore((state) => state.joinPrivateRoom);
    const room = useGameStore((state) => state.room);


    // Watch for room state changes to redirect
    useEffect(() => {
        console.log("room ", room);
        if (room?.roomCode) {
            navigate(`/room/${room.roomCode}`);
        }
    }, [room, navigate]);

    const handlePrevAvatar = () => {
        setAvatarIndex((prev) => (prev === 0 ? AVATARS.length - 1 : prev - 1));
    };

    const handleNextAvatar = () => {
        setAvatarIndex((prev) => (prev === AVATARS.length - 1 ? 0 : prev + 1));
    };

    const handleStartGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const payload = {
            name: name.trim(),
            avatar: AVATARS[avatarIndex],
        };

        switch (activeTab) {
            case "random":
                joinPublicRoom(payload);
                break;

            case "create":
                createPrivateRoom(payload);
                break;

            case "code":
                if (!roomCodeInput.trim()) return;
                joinPrivateRoom({
                    ...payload,
                    roomCode: roomCodeInput.trim().toUpperCase(),
                });
                break;

            case "bot":
                navigate("/room/BOT-PRACTICE");
                break;
        }
    };

    return (
        <div className="w-full flex items-center justify-center py-6">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-slate-900 tracking-wide">
                        Player Setup
                    </h1>
                    <p className="text-sm font-semibold text-slate-500 mt-1">
                        Choose your avatar & set up your game
                    </p>
                </div>

                {/* Connection Status Indicator */}
                {!isConnected && (
                    <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Connecting to server...
                    </div>
                )}

                {/* Display Error Message if Socket Fails */}
                {errorMessage && (
                    <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-xs rounded-2xl text-center">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleStartGame} className="flex flex-col gap-6">

                    {/* Avatar Carousel */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Your Avatar
                        </span>
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                onClick={handlePrevAvatar}
                                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            >
                                ◀
                            </button>

                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-[#F9D601] flex items-center justify-center text-4xl shadow-inner select-none">
                                    {AVATARS[avatarIndex]}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#F9D601] text-[11px] font-bold px-2 py-0.5 rounded-full text-slate-900 shadow-sm border border-white">
                                    {avatarIndex + 1}/{AVATARS.length}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleNextAvatar}
                                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            >
                                ▶
                            </button>
                        </div>
                    </div>

                    {/* Nickname Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Nickname
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. SpeedDoodler"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#F9D601] focus:bg-white transition-all text-base"
                        />
                    </div>

                    {/* Mode Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Game Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            {GAME_MODES.map((mode) => {
                                const isActive = activeTab === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setActiveTab(mode.id as typeof activeTab)}
                                        className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${isActive
                                            ? "bg-amber-50 border-[#F9D601] ring-2 ring-[#F9D601]/50 shadow-xs"
                                            : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                                            <span>{mode.icon}</span>
                                            <span>{mode.label}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 mt-0.5 font-medium">
                                            {mode.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Room Code Input */}
                    {activeTab === "code" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Enter Code
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. ROOM-1234"
                                value={roomCodeInput}
                                onChange={(e) => setRoomCodeInput(e.target.value)}
                                maxLength={12}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F9D601] uppercase tracking-wider text-sm"
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="w-1/3 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center text-sm"
                        >
                            Cancel
                        </button>

                        <div className="relative w-2/3 inline-block">
                            <div className="absolute inset-0 bg-slate-200 translate-x-1 translate-y-1 rounded-xl" />
                            <button
                                type="submit"
                                disabled={!isConnected}
                                className="relative w-full bg-[#F9D601] hover:bg-[#ffe12c] text-slate-900 text-base font-extrabold tracking-wider py-3.5 rounded-xl border-b-4 border-r-4 border-[#DDAF02] active:translate-x-0.5 active:translate-y-0.5 active:border-b-2 active:border-r-2 transition-all cursor-pointer uppercase disabled:opacity-50"
                            >
                                {activeTab === "bot" ? "Start Practice" : "Let's Play"}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}