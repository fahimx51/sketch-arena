import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { registerRoomHandlers } from "./roomHandler";
import { handlePlayerDisconnect } from "../utils/gameManager";
import { registerChatHandlers } from "./chatHandler";

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

        // Real-time canvas drawing transmission
        socket.on("draw_line", ({ roomCode, drawData }) => {
            socket.to(roomCode).emit("draw_line", drawData);
        });

        // Disconnect event
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            handlePlayerDisconnect(io, socket.id);
        });
    });
};