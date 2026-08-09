import { Server, Socket } from "socket.io";
import { addScoreToPlayer, getRoomState } from "../utils/gameManager";

export const registerChatHandlers = (io: Server, socket: Socket) => {
    socket.on("send_message", ({ roomCode, message, senderName }) => {
        console.log(roomCode, message, senderName);
        const room = getRoomState(roomCode);
        if (!room) return;

        // Ensure socket is joined to room channel so sender gets broadcast back
        socket.join(roomCode);

        const cleanMessage = message.trim();
        const isCorrectGuess =
            room.currentWord &&
            cleanMessage.toLowerCase() === room.currentWord.toLowerCase();

        if (isCorrectGuess) {
            // Add score to player
            addScoreToPlayer(roomCode, socket.id, 100);

            // Broadcast success system message to all players
            io.to(roomCode).emit("receive_message", {
                sender: "System",
                text: `🎉 ${senderName} guessed the word correctly!`,
                isSystem: true,
                isCorrect: true,
            });

            // Sync updated player scores
            io.to(roomCode).emit("room_state", room);
        } else {
            // Regular chat message broadcast
            io.to(roomCode).emit("receive_message", {
                sender: senderName,
                text: cleanMessage,
            });
        }
    });
};