// Incoming payload when user joins or creates a room
export interface PlayerPayload {
    name: string;
    avatar: string;
    isPrivate?: boolean;
}

// Incoming payload for joining existing room by code
export interface JoinRoomPayload extends PlayerPayload {
    roomCode: string;
}

// Payload for chat messages
export interface ChatMessagePayload {
    roomCode: string;
    username: string;
    message: string;
}

// Server response event for error handling
export interface SocketErrorPayload {
    message: string;
}


// Player model
export interface Player {
    id: string; // Socket ID
    name: string;
    avatar: string;
    score: number;
    isDrawing: boolean;
}

// Single stroke data for canvas drawing history
export interface DrawStep {
    prevX: number;
    prevY: number;
    currentX: number;
    currentY: number;
    color: string;
    brushSize: number;
}

// Full game room state stored in activeRooms
export interface RoomState {
    roomCode: string;
    isPrivate: boolean;
    currentWord: string;
    timer: number;
    players: Player[];
    canvasHistory: DrawStep[];
}