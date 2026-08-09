import { Server } from "socket.io"; // FIX: Import Server from socket.io
import { RoomState, Player } from "../types";

// 1. Strongly typed maps
const activeRooms = new Map<string, RoomState>();
const socketRoomMap = new Map<string, string>();

/**
 * Add a player to a room
 */
export const addPlayerToRoom = (
    socketId: string,
    roomCode: string,
    playerData: { name: string; avatar: string; isPrivate?: boolean }
): RoomState => {
    let room = activeRooms.get(roomCode);

    // 1. Create room if it doesn't exist
    if (!room) {
        room = {
            roomCode,
            isPrivate: playerData.isPrivate ?? true,
            currentWord: "",
            timer: 60,
            players: [],
            canvasHistory: [],
        };
        activeRooms.set(roomCode, room);
    }

    // 2. Link socketId -> roomCode
    socketRoomMap.set(socketId, roomCode);

    const isFirstPlayer = room.players.length === 0;

    // 3. Strongly typed player object
    const newPlayer: Player = {
        id: socketId,
        name: playerData.name,
        avatar: playerData.avatar,
        score: 0,
        isDrawing: isFirstPlayer,
    };

    // 4. Update or push player
    const existingPlayerIndex = room.players.findIndex(
        (p: Player) => p.id === socketId
    );

    if (existingPlayerIndex !== -1) {
        room.players[existingPlayerIndex] = newPlayer;
    } else {
        room.players.push(newPlayer);
    }

    return room;
};

/**
 * Check if room exists
 */
export const roomExists = (roomCode: string): boolean => {
    return activeRooms.has(roomCode);
};

/**
 * Generate a unique 10-character room code
 */
export const generateRoomCode = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    do {
        code = "";
        for (let i = 0; i < 10; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (roomExists(code));

    return code;
};

/**
 * Find open public room
 */
export const findAvailablePublicRoom = (): string | null => {
    const MAX_PLAYERS = process.env.MAX_PLAYERS
        ? parseInt(process.env.MAX_PLAYERS, 10)
        : 5;

    for (const [roomCode, room] of activeRooms.entries()) {
        if (!room.isPrivate && room.players.length < MAX_PLAYERS) {
            return roomCode;
        }
    }

    return null;
};

/**
 * Handle player disconnect & cleanup
 */
export const handlePlayerDisconnect = (io: Server, socketId: string): void => {
    // Fast O(1) lookup using socketRoomMap
    const roomCode = socketRoomMap.get(socketId);
    if (!roomCode) return;

    // Clean up socket mapping
    socketRoomMap.delete(socketId);

    const room = activeRooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.id === socketId);

    if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        const wasDrawing = disconnectedPlayer.isDrawing;

        // Remove player from room array
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
            activeRooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted because all players left.`);
        } else {
            // Reassign drawing role if the active drawer left
            if (wasDrawing && room.players.length > 0) {
                room.players[0].isDrawing = true;
            }

            // Broadcast updated room state to all remaining players
            io.to(roomCode).emit("player_left", {
                disconnectedId: socketId,
                playerName: disconnectedPlayer.name,
                players: room.players,
            });

            // Sync updated room state across all clients
            io.to(roomCode).emit("room_state", room);
        }
    }
};

/**
 * Get room state by roomCode
 */
export const getRoomState = (roomCode: string): RoomState | undefined => {
    return activeRooms.get(roomCode);
};

/**
 * Add points to a player's score
 */
export const addScoreToPlayer = (
    roomCode: string,
    socketId: string,
    points: number
): void => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === socketId);
    if (player) {
        player.score += points;
    }
};