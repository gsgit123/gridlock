import db from "./setup.js";

const getAllTiles = db.prepare("SELECT * FROM tiles WHERE owner_id IS NOT NULL");
const upsert = db.prepare(`
  INSERT INTO tiles (id, row, col, owner_id, owner_name, owner_color, claimed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    owner_id = excluded.owner_id,
    owner_name = excluded.owner_name,
    owner_color = excluded.owner_color,
    claimed_at = excluded.claimed_at
`);
const getLeaderboard = db.prepare(`
  SELECT owner_name, owner_color, owner_id, COUNT(*) as count
  FROM tiles
  WHERE owner_id IS NOT NULL
  GROUP BY owner_id
  ORDER BY count DESC
  LIMIT 10
`);

export function getClaimed(){
    return getAllTiles.all()
}

export function claimTile(row, col, ownerId, ownerName, ownerColor) {
    const id = `${row}:${col}`;
    const claimedAt = new Date().toISOString();
    upsert.run(id, row, col, ownerId, ownerName, ownerColor, claimedAt);
    return { id, row, col, ownerId, ownerName, ownerColor, claimedAt };
}

export function getLeaderboardData(){
    return getLeaderboard.all();
}

const countClaimed = db.prepare("SELECT COUNT(*) as count FROM tiles WHERE owner_id IS NOT NULL");

export function getClaimedCount() {
    return countClaimed.get().count;
}

export function resetGrid() {
    db.exec("DELETE FROM tiles");
}
