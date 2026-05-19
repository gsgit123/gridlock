import Database from "better-sqlite3";
import{fileURLToPath}from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const DB_PATH = path.join(__dirname, "../../gridlock.db");
const db=new Database(DB_PATH)

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS tiles (
    id TEXT PRIMARY KEY,
    row INTEGER NOT NULL,
    col INTEGER NOT NULL,
    owner_id TEXT,
    owner_name TEXT,
    owner_color TEXT,
    claimed_at TEXT
  )
`);
export default db;