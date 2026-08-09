import { useState, useEffect } from "react";
import { useParams } from "react-router";
import LeftSideBar from "../components/Board/LeftSideBar";
import BoardArea from "../components/Board/BoardArea";
import RightSideBar from "../components/Board/RightSideBar";
import { socket, useGameStore } from "../store/useGameStore";

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    isCorrect?: boolean;
    isSystem?: boolean;
}

export default function Room() {
    const { roomCode } = useParams<{ roomCode: string }>();

    const room = useGameStore((state) => state.room);

    const currentName = localStorage.getItem("player_name") || "Doodler";

    const [guessInput, setGuessInput] = useState("");
    const [chatLog, setChatLog] = useState<ChatMessage[]>([
        { id: "1", sender: "System", text: "Welcome to the game!", isSystem: true },
    ]);

    // Determine if current player is the drawer
    const me = room?.players?.find((p) => p.id === socket.id);
    const isDrawer = me?.isDrawing ?? false;

    // 1. Listen for incoming socket messages
    useEffect(() => {
        // 1. Define named handler
        const handleReceiveMessage = (message: ChatMessage) => {
            setChatLog((prev) => [...prev, message]);
        };

        // 2. Attach listener
        socket.on("receive_message", handleReceiveMessage);

        // 3. Remove ONLY this specific listener function on unmount
        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, []);

    // 2. Emit message to backend on form submit
    const handleSendChat = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!guessInput.trim() || !roomCode) return;

        const trimmedMessage = guessInput.trim();


        // 2. Emit to backend for other players
        socket.emit("send_message", {
            roomCode,
            message: trimmedMessage,
            senderName: currentName,
        });

        setGuessInput("");
    };

    return (
        <div className="w-full max-w-7xl min-h-[80vh] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 select-none">
            <div className="lg:col-span-3">
                <LeftSideBar
                    players={room?.players || []}
                    roomCode={roomCode}
                    isDrawer={isDrawer}
                    onToggleRole={() => { }}
                />
            </div>

            <div className="lg:col-span-6">
                <BoardArea
                    currentWord={room?.currentWord || ""}
                    timer={room?.timer || 60}
                    isDrawer={isDrawer}
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