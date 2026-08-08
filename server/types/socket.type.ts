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

// Payload for draw line event
export interface DrawPayload {
    roomCode: string;
    drawData: import("./game.type").DrawStep;
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