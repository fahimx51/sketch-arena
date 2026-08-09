import { Server, Socket } from "socket.io";
import { PlayerPayload, JoinRoomPayload } from "../types";
import {
    addPlayerToRoom,
    findAvailablePublicRoom,
    generateRoomCode,
    roomExists,
} from "../utils/gameManager";

export const registerRoomHandlers = (io: Server, socket: Socket): void => {

    // 1. CREATE PRIVATE ROOM
    socket.on("create_private_room", ({ name, avatar }: PlayerPayload) => {
        const roomCode = generateRoomCode();
        socket.join(roomCode);

        const room = addPlayerToRoom(socket.id, roomCode, {
            name,
            avatar,
            isPrivate: true,
        });

        // Emit room_state so Zustand updates the room object immediately
        socket.emit("room_state", room);
    });

    // 2. JOIN PUBLIC MATCHMAKING
    socket.on("join_public_room", ({ name, avatar }: PlayerPayload) => {
        let roomCode = findAvailablePublicRoom();

        if (!roomCode) {
            roomCode = generateRoomCode();
        }

        socket.join(roomCode);
        const room = addPlayerToRoom(socket.id, roomCode, {
            name,
            avatar,
            isPrivate: false,
        });

        socket.emit("room_state", room);
        socket.to(roomCode).emit("player_joined", room.players);
    });

    // 3. JOIN PRIVATE ROOM BY CODE
    socket.on("join_room", ({ roomCode, name, avatar }: JoinRoomPayload) => {
        const cleanCode = roomCode?.trim();

        if (!cleanCode || !roomExists(cleanCode)) {
            socket.emit("error_message", "Room not found.");
            return;
        }

        socket.join(cleanCode);
        const room = addPlayerToRoom(socket.id, cleanCode, { name, avatar });

        socket.emit("room_state", room);
        socket.to(cleanCode).emit("player_joined", room.players);
    });

};