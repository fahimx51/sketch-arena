import { Server, Socket } from "socket.io";
import { addScoreToPlayer, getRoomState } from "../utils/gameManager";

// Key: roomCode -> Set of socket.ids that guessed correctly in current round
const guessedPlayersMap = new Map<string, Set<string>>();

// Call this helper whenever a new round or word selection starts!
export const resetGuessedPlayers = (roomCode: string) => {
    guessedPlayersMap.delete(roomCode);
};

export const registerChatHandlers = (io: Server, socket: Socket) => {
    socket.on("send_message", ({ roomCode, message, senderName }) => {
        const room = getRoomState(roomCode);
        if (!room) return;

        socket.join(roomCode);

        const cleanMessage = message?.trim();
        if (!cleanMessage) return;

        // Initialize set for current room
        if (!guessedPlayersMap.has(roomCode)) {
            guessedPlayersMap.set(roomCode, new Set());
        }
        const roomGuessedSet = guessedPlayersMap.get(roomCode)!;

        // -----------------------------------------------------------
        // RULE 1: IF PLAYER ALREADY GUESSED, TREAT MESSAGE AS NORMAL
        // -----------------------------------------------------------
        const hasAlreadyGuessed = roomGuessedSet.has(socket.id);

        const isCorrectGuess =
            !hasAlreadyGuessed &&
            room.currentWord &&
            cleanMessage.toLowerCase() === room.currentWord.toLowerCase();

        if (isCorrectGuess) {
            // 1. Mark player as scored for this round
            roomGuessedSet.add(socket.id);

            // 2. Award score once
            addScoreToPlayer(roomCode, socket.id, 100);
            
            socket.emit("word_revealed_to_guesser", { word: room.currentWord });

            // 3. Broadcast system notification (Hides exact word from chat)
            io.to(roomCode).emit("receive_message", {
                id: Date.now().toString(),
                sender: "System",
                text: `🎉 ${senderName || "A player"} guessed the word!`,
                isSystem: true,
                isCorrect: true,
            });
                        // 4. Send updated leaderboard scores
            io.to(roomCode).emit("room_state", room);
            console.log("after guessed the room is ,", room);

        } else {
            // Regular chat message (or message sent after already guessing)
            io.to(roomCode).emit("receive_message", {
                id: Date.now().toString(),
                sender: senderName || "Player",
                text: cleanMessage,
                isSystem: false,
                isCorrect: false,
            });
        }
    });
};