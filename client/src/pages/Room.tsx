import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import LeftSideBar from "../components/Board/LeftSideBar";
import BoardArea from "../components/Board/BoardArea";
import RightSideBar from "../components/Board/RightSideBar";
import { socket, useGameStore } from "../store/useGameStore";

export default function Room() {
    const navigate = useNavigate();
    const { roomCode } = useParams<{ roomCode: string }>();

    const {
        room,
        timer,
        maskedHint,
        wordChoices,
        chatLog,
        startWordSelection,
        selectWord,
        sendChatMessage,
        isConnected,
    } = useGameStore();

    const [guessInput, setGuessInput] = useState("");

    const me = room?.players?.find((p) => p.id === socket.id);
    const isDrawer = me?.isDrawing ?? false;
    const currentName = me?.name || "Unknown Player";

    // 1. FIX: Wait briefly or check socket connection before redirecting
    useEffect(() => {
        // Only redirect if socket has finished connecting and still no room exists
        const timeout = setTimeout(() => {
            if (!room && isConnected) {
                console.warn("No room state found, redirecting to join...");
                navigate("/join");
            }
        }, 1000); // 1-second buffer for socket sync

        return () => clearTimeout(timeout);
    }, [room, isConnected, navigate]);

    // Fetch word choices when becoming the drawer
    useEffect(() => {
        if (isDrawer && roomCode && !room?.currentWord) {
            startWordSelection();
        }
    }, [isDrawer, roomCode, room?.currentWord, startWordSelection]);

    const handleSendChat = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!guessInput.trim()) return;

        sendChatMessage(guessInput.trim(), currentName);
        setGuessInput("");
    };

    // 2. Show a loading screen while waiting for room data from socket
    if (!room) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-600 font-bold text-sm">Loading room data...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl min-h-[80vh] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 select-none">
            <div className="lg:col-span-3">
                <LeftSideBar
                    players={room?.players || []}
                    roomCode={roomCode}
                    isDrawer={isDrawer}
                />
            </div>

            <div className="lg:col-span-6">
                <BoardArea
                    currentWord={room?.currentWord || ""}
                    maskedHint={maskedHint}
                    timer={timer}
                    isDrawer={isDrawer}
                    wordChoices={wordChoices}
                    onSelectWord={selectWord}
                />
            </div>

            <div className="lg:col-span-3">
                <RightSideBar
                    chatLog={chatLog}
                    guessInput={guessInput}
                    isDrawer={isDrawer}
                    onGuessChange={setGuessInput}
                    onSendChat={handleSendChat}
                />
            </div>
        </div>
    );
}