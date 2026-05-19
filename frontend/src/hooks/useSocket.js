import { useEffect,useRef,useState,useCallback } from "react";
import {io} from "socket.io-client"


import { getOrCreateIdentity } from "../lib/identity";


export function useSocket(){
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [tiles, setTiles] = useState({});
    const [gridSize, setGridSize] = useState(50);
    const [leaderboard, setLeaderboard] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [cooldownEnd, setCooldownEnd] = useState(0);
    const [identity] = useState(() => getOrCreateIdentity());
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";



  useEffect(()=>{
    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;


    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("register", identity);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.on("grid-state", (data) => {
      setTiles(data.tiles);
      setGridSize(data.gridSize);
    });
    socket.on("tile-update", (tile) => {
      setTiles((prev) => ({
        ...prev,
        [`${tile.row}:${tile.col}`]: tile,
      }));
    });

     socket.on("claim-rejected", (data) => {
      if (data.reason === "cooldown") {
        setCooldownEnd(Date.now() + data.cooldownRemaining);
      }
    });
    socket.on("leaderboard", (data) => {
      setLeaderboard(data);
    });
    socket.on("user-count", (count) => {
      setOnlineCount(count);
    });

     return () => {
      socket.disconnect();
    };


  },[]);

  const claimTile=useCallback((row,col)=>{
    if(!socketRef.current)return;

    if(Date.now()<cooldownEnd)return;
    socketRef.current.emit("claim-tile", { row, col });
    setCooldownEnd(Date.now() + 3000); 
  },[cooldownEnd]);

  return{
    isConnected,
    tiles,
    gridSize,
    leaderboard,
    onlineCount,
    cooldownEnd,
    identity,
    claimTile,
  }
}