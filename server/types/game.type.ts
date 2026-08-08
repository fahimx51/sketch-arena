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