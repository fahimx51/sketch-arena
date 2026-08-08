import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { JoinRoomPayload, Player, PlayerPayload, RoomState, SocketErrorPayload } from "../types";

const SOCKET_URL = "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
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
    leaveRoom: () => void;
    clearError: () => void;
}

export const useGameStore = create<GameStore>((set) => {

    socket.on("connect", () => set({ isConnected: true }));
    socket.on("disconnect", () => set({ isConnected: false }));

    socket.on("room_created", ({ room }: { roomCode: string; room: RoomState }) => {
        set({ room, errorMessage: null });
    });

    socket.on("room_state", (room: RoomState) => {
        set({ room, errorMessage: null });
    });

    socket.on("player_joined", (players: Player[]) => {
        set((state) => ({
            room: state.room ? { ...state.room, players } : null,
        }));
    });

    socket.on("error_message", ({ message }: SocketErrorPayload) => {
        set({ errorMessage: message });
    });

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

        leaveRoom: () => set({ room: null }),
        clearError: () => set({ errorMessage: null }),
    };
});