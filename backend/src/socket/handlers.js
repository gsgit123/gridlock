import { GRID_SIZE, COOLDOWN_MS } from "../config.js";
import { claimTile, getClaimed, getLeaderboardData, getClaimedCount, resetGrid } from "../db/query.js";

const cooldowns = new Map();
const onlineUsers = new Map();
let leaderboardTimer = null;

export function regSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`Connected: ${socket.id}`);

        socket.on("register", (userData) => {
            const { userId, userName, userColor } = userData;
            onlineUsers.set(socket.id, { userId, userName, userColor });

            const tiles = getClaimed();
            const tileMap = {}
            tiles.forEach((t) => {
                tileMap[t.id] = {
                    row: t.row,
                    col: t.col,
                    ownerId: t.owner_id,
                    ownerName: t.owner_name,
                    ownerColor: t.owner_color,
                    claimedAt: t.claimed_at,
                }
            })

            socket.emit("grid-state", {
                tiles: tileMap,
                gridSize: GRID_SIZE
            });

            socket.emit("leaderboard", getLeaderboardData());
            io.emit("user-count", onlineUsers.size);
        });

        socket.on("claim-tile", ({ row, col }) => {
            const user = onlineUsers.get(socket.id);
            if (!user) {
                socket.emit("claim-rejected", { reason: "Not registered" });
                return;
            }
            const { userId, userName, userColor } = user;
            if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
                socket.emit("claim-rejected", { reason: "Out of bounds" });
                return;
            }
            const lastClaim = cooldowns.get(userId) || 0;
            const elapsed = Date.now() - lastClaim;
            if (elapsed < COOLDOWN_MS) {
                const remaining = COOLDOWN_MS - elapsed;
                socket.emit("claim-rejected", { reason: "cooldown", cooldownRemaining: remaining });
                return;
            }
            const tile = claimTile(row, col, userId, userName, userColor);
            cooldowns.set(userId, Date.now());

            io.emit("tile-update", {
                row: tile.row,
                col: tile.col,
                ownerId: tile.ownerId,
                ownerName: tile.ownerName,
                ownerColor: tile.ownerColor,
                claimedAt: tile.claimedAt,
            });
            clearTimeout(leaderboardTimer);
            leaderboardTimer = setTimeout(() => {
                io.emit("leaderboard", getLeaderboardData());
            }, 2000);

            const claimedCount = getClaimedCount();
            if (claimedCount >= GRID_SIZE * GRID_SIZE) {
                resetGrid();
                io.emit("grid-state", { tiles: {}, gridSize: GRID_SIZE });
                io.emit("leaderboard", []);
                console.log("Grid full — auto-reset!");
            }
        })

        socket.on("disconnect", () => {
            const user = onlineUsers.get(socket.id);
            onlineUsers.delete(socket.id);
            io.emit("user-count", onlineUsers.size);
            console.log(`Disconnected: ${socket.id} (${user?.userName || "unknown"})`);
        });
    });
}
