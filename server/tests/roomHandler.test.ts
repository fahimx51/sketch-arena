import { registerRoomHandlers } from "../socket/roomHandler";
import * as gameManager from "../utils/gameManager";
import { Server, Socket } from "socket.io";

// Mock the gameManager functions
jest.mock("../utils/gameManager");

describe("Room Socket Handlers", () => {
    let mockIo: Partial<Server>;
    let mockSocket: any;
    let eventListeners: Map<string, Function>;

    beforeEach(() => {
        eventListeners = new Map();

        // Mock socket object
        mockSocket = {
            id: "socket_123",
            join: jest.fn(),
            emit: jest.fn(),
            to: jest.fn().mockReturnValue({
                emit: jest.fn(),
            }),
            // Capture event listener callbacks registered via socket.on
            on: jest.fn((event: string, callback: Function) => {
                eventListeners.set(event, callback);
            }),
        };

        mockIo = {};

        // Register handlers onto mock socket
        registerRoomHandlers(mockIo as Server, mockSocket as Socket);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1. TEST CREATE PRIVATE ROOM
    test("should handle 'create_private_room' event", () => {
        const mockRoomCode = "ROOM_ABC12";
        const mockRoom = {
            roomCode: mockRoomCode,
            isPrivate: true,
            players: [{ id: "socket_123", name: "Fahim", avatar: "🦊" }],
        };

        (gameManager.generateRoomCode as jest.Mock).mockReturnValue(mockRoomCode);
        (gameManager.addPlayerToRoom as jest.Mock).mockReturnValue(mockRoom);

        const createPrivateRoomHandler = eventListeners.get("create_private_room");
        expect(createPrivateRoomHandler).toBeDefined();

        createPrivateRoomHandler!({ name: "Fahim", avatar: "🦊" });

        expect(gameManager.generateRoomCode).toHaveBeenCalled();
        expect(mockSocket.join).toHaveBeenCalledWith(mockRoomCode);
        expect(gameManager.addPlayerToRoom).toHaveBeenCalledWith(
            "socket_123",
            mockRoomCode,
            { name: "Fahim", avatar: "🦊", isPrivate: true }
        );
        expect(mockSocket.emit).toHaveBeenCalledWith("room_created", {
            roomCode: mockRoomCode,
            room: mockRoom,
        });
    });

    // 2. TEST JOIN PUBLIC MATCHMAKING
    describe("join_public_room event", () => {
        test("should join existing available public room", () => {
            const mockRoomCode = "PUBLIC_123";
            const mockRoom = {
                roomCode: mockRoomCode,
                isPrivate: false,
                players: [{ id: "socket_123", name: "Fahim", avatar: "🦊" }],
            };

            (gameManager.findAvailablePublicRoom as jest.Mock).mockReturnValue(
                mockRoomCode
            );
            (gameManager.addPlayerToRoom as jest.Mock).mockReturnValue(mockRoom);

            const joinPublicHandler = eventListeners.get("join_public_room");
            joinPublicHandler!({ name: "Fahim", avatar: "🦊" });

            expect(gameManager.findAvailablePublicRoom).toHaveBeenCalled();
            expect(mockSocket.join).toHaveBeenCalledWith(mockRoomCode);
            expect(mockSocket.emit).toHaveBeenCalledWith("room_state", mockRoom);
            expect(mockSocket.to).toHaveBeenCalledWith(mockRoomCode);
        });

        test("should generate new room if no public room is available", () => {
            const newRoomCode = "NEW_PUB_12";
            (gameManager.findAvailablePublicRoom as jest.Mock).mockReturnValue(null);
            (gameManager.generateRoomCode as jest.Mock).mockReturnValue(newRoomCode);
            (gameManager.addPlayerToRoom as jest.Mock).mockReturnValue({
                roomCode: newRoomCode,
                players: [],
            });

            const joinPublicHandler = eventListeners.get("join_public_room");
            joinPublicHandler!({ name: "Fahim", avatar: "🦊" });

            expect(gameManager.generateRoomCode).toHaveBeenCalled();
            expect(mockSocket.join).toHaveBeenCalledWith(newRoomCode);
        });
    });

    // 3. TEST JOIN PRIVATE ROOM BY CODE
    describe("join_room event", () => {
        test("should emit error if room code does not exist", () => {
            (gameManager.roomExists as jest.Mock).mockReturnValue(false);

            const joinRoomHandler = eventListeners.get("join_room");
            joinRoomHandler!({ roomCode: "INVALID_CODE", name: "Fahim", avatar: "🦊" });

            expect(mockSocket.emit).toHaveBeenCalledWith("error_message", {
                message: "Room not found.",
            });
            expect(mockSocket.join).not.toHaveBeenCalled();
        });

        test("should join room when code is valid", () => {
            const validCode = "VALID_CODE";
            const mockRoom = {
                roomCode: validCode,
                players: [{ id: "socket_123", name: "Fahim", avatar: "🦊" }],
            };

            (gameManager.roomExists as jest.Mock).mockReturnValue(true);
            (gameManager.addPlayerToRoom as jest.Mock).mockReturnValue(mockRoom);

            const joinRoomHandler = eventListeners.get("join_room");
            joinRoomHandler!({
                roomCode: `  ${validCode}  `,
                name: "Fahim",
                avatar: "🦊",
            });

            expect(gameManager.roomExists).toHaveBeenCalledWith(validCode);
            expect(mockSocket.join).toHaveBeenCalledWith(validCode);
            expect(mockSocket.emit).toHaveBeenCalledWith("room_state", mockRoom);
        });
    });
});