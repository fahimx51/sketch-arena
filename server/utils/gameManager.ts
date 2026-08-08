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
    code = ""; // FIX: Reset code on each iteration
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