import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type {
    JoinRoomPayload,
    PlayerPayload,
    RoomState,
    DrawStep,
} from "../types";

export interface ChatMessage {
    id?: string;
    sender: string;
    text: string;
    isCorrect?: boolean;
    isSystem?: boolean;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const socket: Socket = io(SERVER_URL, {
    transports: ["polling", "websocket"],
    autoConnect: true,
});

interface GameStore {
    isConnected: boolean;
    room: RoomState | null;
    timer: number;
    maskedHint: string;
    wordChoices: string[];
    chatLog: ChatMessage[];
    errorMessage: string | null;
    revealedWord: string | null; // 1. Declared in interface

    // Actions
    createPrivateRoom: (payload: PlayerPayload) => void;
    joinPublicRoom: (payload: PlayerPayload) => void;
    joinPrivateRoom: (payload: JoinRoomPayload) => void;
    startWordSelection: () => void;
    selectWord: (selectedWord: string) => void;
    sendChatMessage: (message: string, senderName: string) => void;
    emitDrawLine: (drawData: DrawStep) => void;
    emitClearCanvas: () => void;
    setRevealedWord: (word: string | null) => void; // 2. Declared in interface
    leaveRoom: () => void;
    clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
    // ----------------------------------------------------
    // SOCKET EVENT LISTENERS
    // ----------------------------------------------------

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        set({ isConnected: true, errorMessage: null });
    });

    socket.on("disconnect", () => {
        set({ isConnected: false });
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connect error:", error.message);
        set({ isConnected: false, errorMessage: "Cannot connect to server." });
    });

    // 1. ROOM STATE HANDLERS
    socket.on("room_state", (roomData: RoomState) => {
        console.log("Received room_state:", roomData);
        set({ room: roomData, errorMessage: null });
    });

    socket.on("player_joined", (players) => {
        set((state) => {
            if (!state.room) return state;
            return {
                room: {
                    ...state.room,
                    players,
                },
            };
        });
    });

    socket.on("error_message", (message: string) => {
        console.error("Server Error:", message);
        set({ errorMessage: message });
    });

    // 2. GAME & WORD HANDLERS
    socket.on("choose_word", ({ words }: { words: string[] }) => {
        console.log("Received word choices:", words);
        set({ wordChoices: words });
    });

    socket.on("round_started", ({ currentWord, timer }: { currentWord: string; timer: number }) => {
        console.log("Round started with word:", currentWord);
        set((state) => ({
            wordChoices: [],
            timer,
            revealedWord: null, // Reset revealed word for new round
            room: state.room ? { ...state.room, currentWord } : null,
        }));
    });

    socket.on("timer_update", ({ timer, maskedHint }: { timer: number; maskedHint: string }) => {
        set({ timer, maskedHint });
    });

    socket.on("round_ended", ({ word }: { word: string }) => {
        set((state) => ({
            timer: 0,
            maskedHint: word,
            revealedWord: null, // Reset revealed word when round ends
            room: state.room ? { ...state.room, currentWord: "" } : null,
        }));
    });

    // 3. CHAT HANDLERS
    socket.on("receive_message", (msg: ChatMessage) => {
        set((state) => ({
            chatLog: [...state.chatLog, msg],
        }));
    });

    // 4. DRAWING & WORD REVEAL HANDLERS
    socket.on("clear_canvas", () => {
        set((state) => {
            if (!state.room) return state;
            return {
                room: {
                    ...state.room,
                    canvasHistory: [],
                },
            };
        });
    });

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

    socket.on("word_revealed_to_guesser", ({ word }: { word: string }) => {
        set({ revealedWord: word });
    });

    // ----------------------------------------------------
    // STORE ACTIONS & INITIAL STATE
    // ----------------------------------------------------

    return {
        // Initial State
        isConnected: socket.connected,
        room: null,
        timer: 60,
        maskedHint: "",
        wordChoices: [],
        chatLog: [],
        errorMessage: null,
        revealedWord: null, // Implemented state variable

        // Actions
        createPrivateRoom: (payload) => socket.emit("create_private_room", payload),
        joinPublicRoom: (payload) => socket.emit("join_public_room", payload),
        joinPrivateRoom: (payload) => socket.emit("join_room", payload),

        startWordSelection: () => {
            const roomCode = get().room?.roomCode;
            if (roomCode) {
                socket.emit("start_word_selection", { roomCode });
            }
        },

        selectWord: (selectedWord) => {
            const roomCode = get().room?.roomCode;
            if (roomCode) {
                socket.emit("select_word", { roomCode, selectedWord });
                set({ wordChoices: [] });
            }
        },

        sendChatMessage: (message: string, senderName: string) => {
            const roomCode = get().room?.roomCode;
            if (roomCode) {
                socket.emit("send_message", {
                    roomCode,
                    message,
                    senderName,
                });
            }
        },

        emitDrawLine: (drawData) => {
            const currentRoom = get().room;
            if (currentRoom?.roomCode) {
                socket.emit("draw_line", { roomCode: currentRoom.roomCode, drawData });
                set({
                    room: {
                        ...currentRoom,
                        canvasHistory: [...(currentRoom.canvasHistory || []), drawData],
                    },
                });
            }
        },

        emitClearCanvas: () => {
            const currentRoom = get().room;
            if (currentRoom?.roomCode) {
                socket.emit("clear_canvas", { roomCode: currentRoom.roomCode });
                set({
                    room: { ...currentRoom, canvasHistory: [] },
                });
            }
        },

        setRevealedWord: (word) => set({ revealedWord: word }), // Implemented action method

        leaveRoom: () =>
            set({
                room: null,
                timer: 60,
                maskedHint: "",
                wordChoices: [],
                chatLog: [],
                revealedWord: null,
            }),

        clearError: () => set({ errorMessage: null }),
    };
});