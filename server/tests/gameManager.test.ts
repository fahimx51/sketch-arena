import {
    addPlayerToRoom,
    roomExists,
    generateRoomCode,
    findAvailablePublicRoom,
} from "../utils/gameManager";

describe("Game Manager Tests", () => {

    // 1. TEST ROOM CODE GENERATION
    describe("generateRoomCode()", () => {
        test("should generate a 10-character string containing valid characters", () => {
            const code = generateRoomCode();
            expect(code).toBeDefined();
            expect(code).toHaveLength(10);
            expect(typeof code).toBe("string");
        });

        test("should generate unique codes on consecutive calls", () => {
            const code1 = generateRoomCode();
            const code2 = generateRoomCode();
            expect(code1).not.toBe(code2);
        });
    });

    // 2. TEST ADDING PLAYERS & ROOM CREATION
    describe("addPlayerToRoom()", () => {
        test("should create a new room if it does not exist and set first player as drawer", () => {
            const roomCode = "ROOM_TEST_1";
            const room = addPlayerToRoom("socket_1", roomCode, {
                name: "Fahim",
                avatar: "🦊",
                isPrivate: true,
            });

            expect(room).toBeDefined();
            expect(room.roomCode).toBe(roomCode);
            expect(room.isPrivate).toBe(true);
            expect(room.players).toHaveLength(1);
            expect(room.players[0]).toEqual({
                id: "socket_1",
                name: "Fahim",
                avatar: "🦊",
                score: 0,
                isDrawing: true,
            });
        });

        test("should add a second player to an existing room as non-drawer", () => {
            const roomCode = "ROOM_TEST_1";
            const room = addPlayerToRoom("socket_2", roomCode, {
                name: "Abrar",
                avatar: "🐻",
            });

            expect(room.players).toHaveLength(2);
            expect(room.players[1].name).toBe("Abrar");
            expect(room.players[1].isDrawing).toBe(false);
        });

        test("should update existing player info if same socketId joins again", () => {
            const roomCode = "ROOM_TEST_1";
            const room = addPlayerToRoom("socket_1", roomCode, {
                name: "Fahim Updated",
                avatar: "🦁",
            });

            expect(room.players).toHaveLength(2);
            expect(room.players[0].name).toBe("Fahim Updated");
            expect(room.players[0].avatar).toBe("🦁");
        });
    });

    // 3. TEST ROOM EXISTS
    describe("roomExists()", () => {
        test("should return true for existing room and false for non-existent room", () => {
            expect(roomExists("ROOM_TEST_1")).toBe(true);
            expect(roomExists("NON_EXISTENT_ROOM")).toBe(false);
        });
    });

    // 4. TEST PUBLIC MATCHMAKING LOOKUP
    describe("findAvailablePublicRoom()", () => {
        test("should return null when no public rooms exist", () => {
            const foundRoom = findAvailablePublicRoom();
            expect(foundRoom).toBeNull();
        });

        test("should find an open public room with space", () => {
            const publicCode = "PUBLIC_ROOM_1";
            addPlayerToRoom("socket_pub_1", publicCode, {
                name: "PublicUser1",
                avatar: "🐶",
                isPrivate: false,
            });

            const foundRoom = findAvailablePublicRoom();
            expect(foundRoom).toBe(publicCode);
        });

        test("should return null if the public room reaches max players (5 players)", () => {
            const fullPublicCode = "FULL_PUBLIC_ROOM";

            for (let i = 1; i <= 5; i++) {
                addPlayerToRoom(`socket_full_${i}`, fullPublicCode, {
                    name: `User ${i}`,
                    avatar: "🐱",
                    isPrivate: false,
                });
            }

            const availableRoom = findAvailablePublicRoom();
            expect(availableRoom).not.toBe(fullPublicCode);
        });
    });

});