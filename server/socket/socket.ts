import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { registerRoomHandlers } from "./roomHandler";
import { getRoomState, handlePlayerDisconnect } from "../utils/gameManager";
import { registerChatHandlers } from "./chatHandler";
import { registerGameHandlers, startRoundTimer } from "./gameHandler";

export const initSocket = (server: HTTPServer) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // Register all room-related event handlers
        registerRoomHandlers(io, socket);
        registerChatHandlers(io, socket);
        registerGameHandlers(io, socket);

        // Real-time canvas drawing transmission
        socket.on("draw_line", ({ roomCode, drawData }) => {
            const room = getRoomState(roomCode);

            if (room) {
                if (!room.canvasHistory) {
                    room.canvasHistory = [];
                }
                // Save the draw step to in-memory room state!
                room.canvasHistory.push(drawData);
            }

            // Broadcast live line to everyone else in room
            socket.to(roomCode).emit("draw_line", drawData);
        });

        // Disconnect event
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            handlePlayerDisconnect(io, socket.id);
        });
    });
};