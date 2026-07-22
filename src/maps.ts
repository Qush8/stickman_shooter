export type PlatformDef = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "static" | "elevator";
  vx?: number;
  minX?: number;
  maxX?: number;
};

export type MapTheme = {
  background: number;
  gridLine: number;
  gridBorder: number;
  floor: number;
};

export type MapDef = {
  id: string;
  displayName: string;
  platforms: PlatformDef[];
  spawns: number[];
  elevatorYLevels: number[];
  theme: MapTheme;
};

export const ARENA_W = 912;
export const ARENA_H = 500;

const DEFAULT_PLATFORMS: PlatformDef[] = [
  { id: 0, x: 63, y: 388, w: 118, h: 12, kind: "static" },
  {
    id: 1,
    x: 234,
    y: 273,
    w: 118,
    h: 12,
    kind: "elevator",
    vx: 22,
    minX: 154,
    maxX: 314,
  },
  { id: 2, x: 405, y: 388, w: 118, h: 12, kind: "static" },
  {
    id: 3,
    x: 576,
    y: 273,
    w: 118,
    h: 12,
    kind: "elevator",
    vx: -22,
    minX: 496,
    maxX: 656,
  },
  { id: 4, x: 405, y: 158, w: 118, h: 12, kind: "static" },
  {
    id: 5,
    x: 234,
    y: 43,
    w: 118,
    h: 12,
    kind: "elevator",
    vx: 22,
    minX: 154,
    maxX: 314,
  },
];

const TOWERS_PLATFORMS: PlatformDef[] = [
  { id: 0, x: 80, y: 420, w: 100, h: 12, kind: "static" },
  { id: 1, x: 80, y: 320, w: 100, h: 12, kind: "static" },
  { id: 2, x: 80, y: 220, w: 100, h: 12, kind: "static" },
  { id: 3, x: 732, y: 420, w: 100, h: 12, kind: "static" },
  { id: 4, x: 732, y: 320, w: 100, h: 12, kind: "static" },
  { id: 5, x: 732, y: 220, w: 100, h: 12, kind: "static" },
  {
    id: 6,
    x: 350,
    y: 180,
    w: 212,
    h: 12,
    kind: "elevator",
    vx: 18,
    minX: 280,
    maxX: 420,
  },
  {
    id: 7,
    x: 350,
    y: 340,
    w: 212,
    h: 12,
    kind: "elevator",
    vx: -18,
    minX: 280,
    maxX: 420,
  },
];

const OPEN_PLATFORMS: PlatformDef[] = [
  { id: 0, x: 120, y: 388, w: 140, h: 12, kind: "static" },
  { id: 1, x: 652, y: 388, w: 140, h: 12, kind: "static" },
  {
    id: 2,
    x: 386,
    y: 273,
    w: 140,
    h: 12,
    kind: "elevator",
    vx: 24,
    minX: 300,
    maxX: 472,
  },
  { id: 3, x: 386, y: 158, w: 140, h: 12, kind: "static" },
];

export const MAP_ORDER = ["default", "towers", "open"] as const;
export type MapId = (typeof MAP_ORDER)[number];

export const MAPS: Record<MapId, MapDef> = {
  default: {
    id: "default",
    displayName: "Default Arena",
    platforms: DEFAULT_PLATFORMS,
    spawns: [114, ARENA_W - 114, 342, 570],
    elevatorYLevels: [158, 273, 388],
    theme: {
      background: 0x242424,
      gridLine: 0x3a3a3a,
      gridBorder: 0x555555,
      floor: 0x3d4654,
    },
  },
  towers: {
    id: "towers",
    displayName: "Tower Flanks",
    platforms: TOWERS_PLATFORMS,
    spawns: [130, ARENA_W - 130, 456, 456],
    elevatorYLevels: [180, 340, 420],
    theme: {
      background: 0x1a2433,
      gridLine: 0x2a3545,
      gridBorder: 0x445566,
      floor: 0x2d3a4a,
    },
  },
  open: {
    id: "open",
    displayName: "Open Center",
    platforms: OPEN_PLATFORMS,
    spawns: [180, ARENA_W - 180, 300, 612],
    elevatorYLevels: [158, 273, 388],
    theme: {
      background: 0x2a2218,
      gridLine: 0x3d3428,
      gridBorder: 0x665544,
      floor: 0x4a4035,
    },
  },
};

export const getMap = (mapId: string): MapDef => MAPS[mapId as MapId] ?? MAPS.default;

export const getNextMapId = (currentMapId: string): MapId => {
  const idx = MAP_ORDER.indexOf(currentMapId as MapId);
  const next = idx < 0 ? 0 : (idx + 1) % MAP_ORDER.length;
  return MAP_ORDER[next];
};
