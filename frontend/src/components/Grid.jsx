import { useMemo, useState, useRef, useCallback, useEffect, memo } from "react";

const TILE_SIZE = 13;
const GAP = 1;
const CELL = TILE_SIZE + GAP;

function Grid({ tiles, gridSize, identity, onTileClick }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);
  const [animatingTiles, setAnimatingTiles] = useState(new Set());
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const prevTilesRef = useRef({});
  const lastTouchRef = useRef(null);
  const pinchStartRef = useRef(null);
  const touchMovedRef = useRef(false);
  const scaleRef = useRef(1);
  const draggingRef = useRef(false);

  scaleRef.current = scale;
  draggingRef.current = dragging;

  useEffect(() => {
    const prev = prevTilesRef.current;
    const newAnimating = new Set();

    Object.keys(tiles).forEach((key) => {
      if (!prev[key] || prev[key].ownerId !== tiles[key].ownerId) {
        newAnimating.add(key);
      }
    });

    if (newAnimating.size > 0) {
      setAnimatingTiles(newAnimating);
      const timer = setTimeout(() => setAnimatingTiles(new Set()), 300);
      prevTilesRef.current = { ...tiles };
      return () => clearTimeout(timer);
    }

    prevTilesRef.current = { ...tiles };
  }, [tiles]);

  const gridPx = gridSize * CELL;

  const getTileFromEvent = useCallback((e) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / gridPx);
    const y = (e.clientY - rect.top) / (rect.height / gridPx);
    const col = Math.floor(x / CELL);
    const row = Math.floor(y / CELL);
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
    return { row, col };
  }, [gridSize, gridPx]);

  const handleGridClick = useCallback((e) => {
    if (draggingRef.current || touchMovedRef.current) return;
    const pos = getTileFromEvent(e);
    if (pos) onTileClick(pos.row, pos.col);
  }, [getTileFromEvent, onTileClick]);

  const handleGridHover = useCallback((e) => {
    const pos = getTileFromEvent(e);
    if (!pos) { setTooltip(null); return; }
    const key = `${pos.row}:${pos.col}`;
    const tile = tiles[key] || null;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 8,
      tile,
    });
  }, [getTileFromEvent, tiles]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      setScale((prev) => {
        const next = prev + (e.deltaY > 0 ? -0.15 : 0.15);
        return Math.min(Math.max(next, 0.4), 3);
      });
    };

    const getTouchDistance = (t1, t2) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchStartRef.current = {
          distance: getTouchDistance(e.touches[0], e.touches[1]),
          scale: scaleRef.current,
        };
        touchMovedRef.current = true;
      } else if (e.touches.length === 1) {
        touchMovedRef.current = false;
        lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchStartRef.current) {
        const dist = getTouchDistance(e.touches[0], e.touches[1]);
        const ratio = dist / pinchStartRef.current.distance;
        setScale(Math.min(Math.max(pinchStartRef.current.scale * ratio, 0.4), 3));
        touchMovedRef.current = true;
      } else if (e.touches.length === 1 && lastTouchRef.current) {
        const dx = e.touches[0].clientX - lastTouchRef.current.x;
        const dy = e.touches[0].clientY - lastTouchRef.current.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) touchMovedRef.current = true;
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      pinchStartRef.current = null;
      lastTouchRef.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setDragging(false); setTooltip(null); }}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={() => setScale((s) => Math.min(s + 0.25, 3))} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-bold transition-colors">+</button>
        <button onClick={() => setScale((s) => Math.max(s - 0.25, 0.4))} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-bold transition-colors">−</button>
        <button onClick={handleReset} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors">⟲</button>
      </div>

      <div className="absolute bottom-3 right-3 z-10 text-xs text-gray-500">
        {Math.round(scale * 100)}%
      </div>

      <div
        ref={gridRef}
        className="absolute"
        onClick={handleGridClick}
        onMouseMove={handleGridHover}
        onMouseLeave={() => setTooltip(null)}
        style={{
          width: `${gridPx}px`,
          height: `${gridPx}px`,
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "center center",
          left: "50%",
          top: "50%",
          marginLeft: `-${gridPx / 2}px`,
          marginTop: `-${gridPx / 2}px`,
          willChange: "transform",
        }}
      >
        <TileLayer tiles={tiles} gridSize={gridSize} identity={identity} animatingTiles={animatingTiles} />
      </div>

      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-xs shadow-lg hidden md:block"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.tile ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tooltip.tile.ownerColor }} />
                <span className="text-white font-medium">{tooltip.tile.ownerName}</span>
              </div>
              <span className="text-gray-400">{timeAgo(tooltip.tile.claimedAt)}</span>
            </div>
          ) : (
            <span className="text-gray-400">Click to claim</span>
          )}
        </div>
      )}
    </div>
  );
}

const TileLayer = memo(function TileLayer({ tiles, gridSize, identity, animatingTiles }) {
  const cells = useMemo(() => {
    const arr = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        arr.push(`${r}:${c}`);
      }
    }
    return arr;
  }, [gridSize]);

  return (
    <div
      className="grid gap-[1px] bg-gray-800/30 p-1 rounded-lg w-full h-full"
      style={{ gridTemplateColumns: `repeat(${gridSize}, ${TILE_SIZE}px)` }}
    >
      {cells.map((key) => (
        <Tile
          key={key}
          tile={tiles[key]}
          isMine={tiles[key]?.ownerId === identity.userId}
          isAnimating={animatingTiles.has(key)}
        />
      ))}
    </div>
  );
});

const Tile = memo(function Tile({ tile, isMine, isAnimating }) {
  return (
    <div
      className={`
        transition-colors duration-150
        ${tile ? "" : "bg-gray-800/60"}
        ${isMine ? "ring-1 ring-white/30" : ""}
        ${isAnimating ? "tile-animate" : ""}
      `}
      style={{
        backgroundColor: tile?.ownerColor || undefined,
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        borderRadius: "2px",
      }}
    />
  );
});

export default Grid;
