export const WINDOW_HEIGHT = 512, WINDOW_WIDTH = 512
export const MAX_FOOTSTEPS = 100;
export const WOOD_PLACE_DISTANCE = 200;
export const DEBUG = false;
export const FIRE_AFFECT_DISTANCE = 200;

export const SNOWSHOE_BUFF = 30;
export const THERMOS_BUFF = 10;
export const MITTENS_BUFF = 20;
export const TOQUE_BUFF = 20;
export const DEFAULT_SPAWN_RANGE = 2500;

export const MAX_WOOD = 10;

const heatmap = [
 "#d4451e", 
 "#d47126",
 "#d48626",
 "#d4b726",
 "#26a6d4",
 "#2a75bf",
 "#1c4dc9",
]

export function colorForTemp(temp) {
    temp = Math.min(99, temp)
    temp /= (100 / heatmap.length)
    temp = Math.floor(temp)
    return heatmap[heatmap.length - 1 - temp]
}

export function iconForTemp(temp) {
    if (temp > 60) {
        return "icon-warm.png"
    } else if (temp > 25) {
        return "icon-cold.png"
    } else {
        return "icon-freezing.png"
    }
}