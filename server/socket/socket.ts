import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

export const initSocket = (server: HTTPServer) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Adjust for frontend URL in production
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join room
        socket.on("join_room", (roomCode: string) => {
            socket.join(roomCode);
        });

        // Real-time canvas drawing transmission
        socket.on("draw_line", ({ roomCode, drawData }) => {
            socket.to(roomCode).emit("draw_line", drawData);
        });

        // Disconnect event
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};