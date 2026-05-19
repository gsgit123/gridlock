import {nanoid} from "nanoid"

const COLORS = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c",
  "#3498db", "#9b59b6", "#e84393", "#00cec9", "#6c5ce7",
  "#fd79a8", "#ffeaa7", "#55efc4", "#74b9ff", "#a29bfe",
  "#ff7675", "#fab1a0", "#81ecec", "#dfe6e9", "#fdcb6e",
];
const ADJECTIVES = [
  "Swift", "Bold", "Lucky", "Chill", "Pixel",
  "Neon", "Turbo", "Mystic", "Cosmic", "Stealthy",
  "Rusty", "Fuzzy", "Sneaky", "Witty", "Jolly",
];
const NOUNS = [
  "Fox", "Wolf", "Panda", "Hawk", "Otter",
  "Tiger", "Raven", "Gecko", "Lynx", "Bear",
  "Shark", "Cobra", "Eagle", "Moose", "Badger",
];


export function genUserName(){
    const adj=ADJECTIVES[Math.floor(Math.random()*ADJECTIVES.length)]
    const noun=NOUNS[Math.floor(Math.random()*NOUNS.length)]
    const num = Math.floor(Math.random()*100);
    return `${adj}${noun}${num}`
}

export function getColor(){
    return COLORS[Math.floor(Math.random()*COLORS.length)]
}

