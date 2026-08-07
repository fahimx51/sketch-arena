import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router";
import LeftSideBar from "../components/Board/LeftSideBar";
import BoardArea from "../components/Board/BoardArea";
import RightSideBar from "../components/Board/RightSideBar";

interface Player {
    id: string;
    name: string;
    avatar: string;
    score: number;
    isDrawing: boolean;
}

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    isCorrect?: boolean;
    isSystem?: boolean;
}

export default function Room() {
    const { roomCode } = useParams<{ roomCode: string }>();

    const currentName = localStorage.getItem("player_name") || "Doodler";
    const currentAvatar = localStorage.getItem("player_avatar") || "🐶";

    const [players, setPlayers] = useState<Player[]>([
        { id: "1", name: currentName, avatar: currentAvatar, score: 240, isDrawing: true },
        { id: "2", name: "Alex", avatar: "🐱", score: 310, isDrawing: false },
        { id: "3", name: "Sam", avatar: "🦊", score: 180, isDrawing: false },
    ]);

    const [timer, setTimer] = useState(45);
    const [currentWord, setCurrentWord] = useState("GUITAR");
    const [isDrawer, setIsDrawer] = useState(true);
    const [guessInput, setGuessInput] = useState("");

    const [chatLog, setChatLog] = useState<ChatMessage[]>([
        { id: "1", sender: "System", text: "Alex is drawing now!", isSystem: true },
        { id: "2", sender: "Sam", text: "is it a violin?" },
    ]);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendChat = (e: FormEvent) => {
        e.preventDefault();
        if (!guessInput.trim()) return;

        const text = guessInput.trim();
        const isCorrect = text.toUpperCase() === currentWord.toUpperCase();

        if (isCorrect) {
            setChatLog((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    sender: "System",
                    text: `${currentName} guessed the word correctly! 🎉`,
                    isCorrect: true,
                },
            ]);
            setPlayers((prev) =>
                prev.map((p) => (p.name === currentName ? { ...p, score: p.score + 100 } : p))
            );
        } else {
            setChatLog((prev) => [
                ...prev,
                { id: Date.now().toString(), sender: currentName, text },
            ]);
        }

        setGuessInput("");
    };

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 select-none">
            <div className="lg:col-span-3">
                <LeftSideBar
                    players={players}
                    roomCode={roomCode}
                    isDrawer={isDrawer}
                    onToggleRole={() => setIsDrawer(!isDrawer)}
                />
            </div>

            <div className="lg:col-span-6">
                <BoardArea
                    currentWord={currentWord}
                    timer={timer}
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