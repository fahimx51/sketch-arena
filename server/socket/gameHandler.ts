import { Server, Socket } from "socket.io";
import { getRoomState, rotateDrawer } from "../utils/gameManager";
import { getRandomWords } from "../utils/words";
import { getMaskedWord, getNextHintIndex } from "../utils/HintManager";

const activeTimers = new Map<string, NodeJS.Timeout>();
const selectionTimers = new Map<string, NodeJS.Timeout>();

// Helper to clear both timers for a room
const clearRoomTimers = (roomCode: string) => {
    if (activeTimers.has(roomCode)) {
        clearInterval(activeTimers.get(roomCode)!);
        activeTimers.delete(roomCode);
    }
    if (selectionTimers.has(roomCode)) {
        clearTimeout(selectionTimers.get(roomCode)!);
        selectionTimers.delete(roomCode);
    }
};

export const startRoundTimer = (io: Server, roomCode: string) => {
    clearRoomTimers(roomCode);

    let timer = 60;
    let revealedIndexes: number[] = [];

    const interval = setInterval(() => {
        const room = getRoomState(roomCode);
        if (!room || !room.currentWord) {
            clearRoomTimers(roomCode);
            return;
        }

        timer -= 1;

        const indexToReveal = getNextHintIndex(room.currentWord, revealedIndexes, timer);
        if (indexToReveal !== null) {
            revealedIndexes.push(indexToReveal);
        }

        const maskedHint = getMaskedWord(room.currentWord, revealedIndexes);

        io.to(roomCode).emit("timer_update", {
            timer,
            maskedHint,
        });

        if (timer <= 0) {
            clearRoomTimers(roomCode);

            // 1. Notify round ended
            io.to(roomCode).emit("round_ended", { word: room.currentWord });

            // 2. Clear state
            room.currentWord = "";
            room.canvasHistory = [];
            io.to(roomCode).emit("clear_canvas");

            // 3. Rotate drawer
            rotateDrawer(roomCode);

            // 4. Broadcast updated room state
            io.to(roomCode).emit("room_state", room);

            // 5. Trigger next word selection after 3 seconds
            setTimeout(() => {
                triggerWordSelection(io, roomCode);
            }, 3000);
        }
    }, 1000);

    activeTimers.set(roomCode, interval);
};

// Start word selection + 15s timeout
const triggerWordSelection = (io: Server, roomCode: string) => {
    const room = getRoomState(roomCode);
    if (!room) return;

    // Ensure there is an assigned drawer
    let drawer = room.players.find((p) => p.isDrawing);
    if (!drawer && room.players.length > 0) {
        rotateDrawer(roomCode);
        drawer = room.players.find((p) => p.isDrawing);
    }

    if (!drawer) return;

    const wordChoices = getRandomWords(5);
    io.to(drawer.id).emit("choose_word", { words: wordChoices });

    // Set a 15-second timer for word picking
    const selectionTimeout = setTimeout(() => {
        const currentRoom = getRoomState(roomCode);
        if (!currentRoom || currentRoom.currentWord) return;

        // Auto-select the first word if drawer timed out
        const autoSelectedWord = wordChoices[0];
        currentRoom.currentWord = autoSelectedWord;

        io.to(roomCode).emit("round_started", {
            currentWord: autoSelectedWord,
            timer: 60,
        });

        startRoundTimer(io, roomCode);
    }, 15000); // 15 seconds limit

    selectionTimers.set(roomCode, selectionTimeout);
};

export const registerGameHandlers = (io: Server, socket: Socket) => {
    socket.on("start_word_selection", ({ roomCode }) => {
        triggerWordSelection(io, roomCode);
    });

    socket.on("select_word", ({ roomCode, selectedWord }) => {
        const room = getRoomState(roomCode);
        if (!room) return;

        // Cancel the 15-second selection timeout immediately
        if (selectionTimers.has(roomCode)) {
            clearTimeout(selectionTimers.get(roomCode)!);
            selectionTimers.delete(roomCode);
        }

        // Save word and start main game timer
        room.currentWord = selectedWord;

        io.to(roomCode).emit("round_started", {
            currentWord: selectedWord,
            timer: 60,
        });

        startRoundTimer(io, roomCode);
    });
};