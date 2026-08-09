import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type {
    JoinRoomPayload,
    PlayerPayload,
    RoomState,
    SocketErrorPayload,
    DrawStep
} from "../types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const socket: Socket = io(SERVER_URL, {
    transports: ["websocket"],
    autoConnect: true,
});

interface GameStore {
    isConnected: boolean;
    room: RoomState | null;
    errorMessage: string | null;

    // Actions
    createPrivateRoom: (payload: PlayerPayload) => void;
    joinPublicRoom: (payload: PlayerPayload) => void;
    joinPrivateRoom: (payload: JoinRoomPayload) => void;
    emitDrawLine: (drawData: DrawStep) => void;
    leaveRoom: () => void;
    clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {

    // -------------------------------------------------------------
    // GLOBAL SOCKET LISTENERS
    // -------------------------------------------------------------

    socket.on("connect", () => {
        console.log("Connected to server:", socket.id);
        set({ isConnected: true });
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from server");
        set({ isConnected: false });
    });

    // Handle private room creation response ({ roomCode, room })
    socket.on("room_created", ({ room }: { roomCode: string; room: RoomState }) => {
        console.log("Room Created:", room);
        set({ room, errorMessage: null });
    });

    // Handle public join & code join responses (room)
    socket.on("room_state", (room: RoomState) => {
        console.log("Room State Received:", room);
        set({ room, errorMessage: null });
    });

    // Listen for new players joining the room
    socket.on("player_joined", (players) => {
        set((state) => ({
            room: state.room ? { ...state.room, players } : null,
        }));
    });

    // Listen for real-time incoming drawing steps from other players
    socket.on("draw_line", (drawData: DrawStep) => {
        set((state) => {
            if (!state.room) return state;
            return {
                room: {
                    ...state.room,
                    canvasHistory: [...(state.room.canvasHistory || []), drawData],
                },
            };
        });
    });

    // Handle server error messages
    socket.on("error_message", ({ message }: SocketErrorPayload) => {
        console.error("Socket Error:", message);
        set({ errorMessage: message });
    });

    // -------------------------------------------------------------
    // STORE ACTIONS
    // -------------------------------------------------------------

    return {
        isConnected: socket.connected,
        room: null,
        errorMessage: null,

        createPrivateRoom: (payload) => {
            socket.emit("create_private_room", payload);
        },

        joinPublicRoom: (payload) => {
            socket.emit("join_public_room", payload);
        },

        joinPrivateRoom: (payload) => {
            socket.emit("join_room", payload);
        },

        emitDrawLine: (drawData) => {
            const currentRoom = get().room;
            if (currentRoom?.roomCode) {
                // Emit line data to backend
                socket.emit("draw_line", {
                    roomCode: currentRoom.roomCode,
                    drawData,
                });

                // Optimistically update local canvas history
                set({
                    room: {
                        ...currentRoom,
                        canvasHistory: [...(currentRoom.canvasHistory || []), drawData],
                    },
                });
            }
        },

        leaveRoom: () => {
            set({ room: null });
        },

        clearError: () => set({ errorMessage: null }),
    };
});