import { useSocket } from "./hooks/useSocket";
import Grid from "./components/Grid";
import { useState, useEffect, useMemo } from "react";

function App() {
  const {
    isConnected,
    tiles,
    gridSize,
    leaderboard,
    onlineCount,
    cooldownEnd,
    identity,
    claimTile,
  } = useSocket();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const tileCount = Object.keys(tiles).length;
  const totalTiles = gridSize * gridSize;
  const fillPercent = Math.round((tileCount / totalTiles) * 100);

  const myTileCount = useMemo(() => {
    return Object.values(tiles).filter((t) => t.ownerId === identity.userId).length;
  }, [tiles, identity.userId]);

  return (
    <div className="h-screen flex flex-col bg-[#0f1117] overflow-hidden">
      <header className="flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 bg-[#161822] border-b border-gray-800/60 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="text-base md:text-lg font-semibold text-white tracking-tight">Gridlock</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`} />
            <span className="text-[10px] md:text-xs text-gray-500">{isConnected ? "Live" : "Offline"}</span>
          </div>
          <span className="hidden md:inline text-[11px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">
            {fillPercent}%
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-sm shrink-0">
          <span className="hidden md:inline text-gray-500 text-xs">{onlineCount} online</span>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: identity.userColor }}
            />
            <span className="text-gray-300 text-xs md:text-sm">{identity.userName}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-hidden">
          {isConnected ? (
            <Grid
              tiles={tiles}
              gridSize={gridSize}
              identity={identity}
              onTileClick={claimTile}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            </div>
          )}
        </main>

        <aside className="hidden md:flex w-60 bg-[#161822] border-l border-gray-800/60 flex-col">
          <div className="px-4 py-3 border-b border-gray-800/40">
            <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Your Stats</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: identity.userColor }}
              >
                {identity.userName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{identity.userName}</p>
                <p className="text-xs text-gray-500">{myTileCount} tiles owned</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-gray-800/40">
            <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Cooldown</h3>
            <CooldownTimer cooldownEnd={cooldownEnd} />
          </div>

          <div className="px-4 py-3 border-b border-gray-800/40">
            <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Grid</h3>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{tileCount} / {totalTiles} claimed</span>
              <span>{fillPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500/70 rounded-full transition-all duration-300"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          <div className="px-4 py-3 flex-1 overflow-y-auto">
            <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Leaderboard</h3>
            <LeaderboardList leaderboard={leaderboard} identity={identity} />
          </div>

          <div className="px-4 py-2.5 border-t border-gray-800/40 text-[10px] text-gray-600 text-center">
            Scroll to zoom · Drag to pan
          </div>
        </aside>

        <div className="md:hidden absolute bottom-16 right-4 z-30">
          <MobileCooldown cooldownEnd={cooldownEnd} />
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden absolute bottom-4 right-4 z-30 w-11 h-11 bg-[#1e2030] border border-gray-700/60 rounded-full flex items-center justify-center text-gray-400 shadow-lg active:scale-95 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
          </svg>
        </button>

        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
            <div className="relative bg-[#161822] border-t border-gray-800/60 rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/40">
                <span className="text-sm text-white font-medium">Stats</span>
                <button onClick={() => setDrawerOpen(false)} className="text-gray-500 text-xl leading-none">&times;</button>
              </div>

              <div className="overflow-y-auto flex-1">
                <div className="px-4 py-3 border-b border-gray-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: identity.userColor }}
                      >
                        {identity.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{identity.userName}</p>
                        <p className="text-xs text-gray-500">{myTileCount} tiles</p>
                      </div>
                    </div>
                    <CooldownTimer cooldownEnd={cooldownEnd} />
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-800/40">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{tileCount} / {totalTiles} claimed</span>
                    <span>{fillPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/70 rounded-full transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{onlineCount} online</span>
                  </div>
                </div>

                <div className="px-4 py-3">
                  <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Leaderboard</h3>
                  <LeaderboardList leaderboard={leaderboard} identity={identity} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardList({ leaderboard, identity }) {
  if (leaderboard.length === 0) {
    return <p className="text-gray-600 text-xs">No tiles claimed yet</p>;
  }
  return (
    <ul className="space-y-1">
      {leaderboard.map((entry, i) => (
        <li
          key={entry.owner_id}
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-sm ${
            entry.owner_id === identity.userId ? "bg-gray-800/50" : ""
          }`}
        >
          <span className="text-gray-600 w-4 text-right text-xs font-mono">{i + 1}</span>
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.owner_color }}
          />
          <span className={`truncate ${
            entry.owner_id === identity.userId ? "text-white font-medium" : "text-gray-400"
          }`}>
            {entry.owner_name}
          </span>
          <span className="ml-auto text-gray-500 text-xs font-mono">{entry.count}</span>
        </li>
      ))}
    </ul>
  );
}

function CooldownTimer({ cooldownEnd }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 50);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, cooldownEnd - Date.now());
  const seconds = (remaining / 1000).toFixed(1);

  if (remaining <= 0) {
    return <span className="text-emerald-400 text-sm">Ready</span>;
  }

  return (
    <div className="min-w-[80px]">
      <div className="flex justify-between mb-1">
        <span className="text-amber-400 text-sm font-medium">{seconds}s</span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-100"
          style={{ width: `${(remaining / 3000) * 100}%` }}
        />
      </div>
    </div>
  );
}

function MobileCooldown({ cooldownEnd }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, cooldownEnd - Date.now());

  if (remaining <= 0) return null;

  const seconds = (remaining / 1000).toFixed(1);

  return (
    <div className="bg-[#1e2030] border border-gray-700/60 rounded-full px-3 py-1 text-xs text-amber-400 font-medium shadow-lg">
      {seconds}s
    </div>
  );
}

export default App;
