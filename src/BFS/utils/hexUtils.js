// Basic hex grid utility functions

export const Point = (x, y) => {
  return { x, y };
};

export const Hex = (q, r, s) => {
  return { q, r, s };
};

export const hexToPixel = (hex, hexSize, hexOrigin) => {
  // Add safety check to prevent undefined errors
  if (!hexOrigin) {
    console.error("hexOrigin is undefined in hexToPixel");
    return { x: 0, y: 0 }; // Return default to prevent crash
  }
  
  let x = hexSize * Math.sqrt(3) * (hex.q + hex.r / 2) + hexOrigin.x;
  let y = (hexSize * 3) / 2 * hex.r + hexOrigin.y;
  return { x, y };
};

export const pixelToHex = (point, hexSize, hexOrigin) => {
  // Add safety check
  if (!point || !hexOrigin) {
    console.error("Missing parameters in pixelToHex");
    return { q: 0, r: 0, s: 0 };
  }
  
  let q = ((point.x - hexOrigin.x) * Math.sqrt(3) / 3 - (point.y - hexOrigin.y) / 3) / hexSize;
  let r = ((point.y - hexOrigin.y) * 2) / (3 * hexSize);
  return { q, r, s: -q - r };
};

export const cubeRound = (cube) => {
  let rx = Math.round(cube.q);
  let ry = Math.round(cube.r);
  let rz = Math.round(cube.s);
  
  const x_diff = Math.abs(rx - cube.q);
  const y_diff = Math.abs(ry - cube.r);
  const z_diff = Math.abs(rz - cube.s);
  
  if (x_diff > y_diff && x_diff > z_diff) {
    rx = -ry - rz;
  } else if (y_diff > z_diff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }
  
  return { q: rx, r: ry, s: rz };
};

export const getHexParameters = (hexSize) => {
  const hexHeight = hexSize * 2;
  const hexWidth = (Math.sqrt(3) / 2) * hexHeight;
  const vertDist = (hexHeight * 3) / 4;
  const horizDist = hexWidth;
  return { hexWidth, hexHeight, vertDist, horizDist };
};

export const cubeDirection = (direction) => {
  const cubeDirections = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 }
  ];
  return cubeDirections[direction];
};

export const cubeAdd = (a, b) => {
  return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
};

export const cubeSubtract = (hexA, hexB) => {
  return { q: hexA.q - hexB.q, r: hexA.r - hexB.r, s: hexA.s - hexB.s };
};

export const getCubeNeighbor = (h, direction) => {
  return cubeAdd(h, cubeDirection(direction));
};

export const getNeighbors = (h) => {
  const arr = [];
  for (let i = 0; i <= 5; i++) {
    const { q, r, s } = getCubeNeighbor({ q: h.q, r: h.r, s: h.s }, i);
    arr.push({ q, r, s });
  }
  return arr;
};

export const cubeDistance = (hexA, hexB) => {
  const { q, r, s } = cubeSubtract(hexA, hexB);
  return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
};

export const linearInterpolation = (a, b, t) => {
  return a + (b - a) * t;
};

export const cubeLinearInt = (hexA, hexB, t) => {
  return {
    q: linearInterpolation(hexA.q, hexB.q, t),
    r: linearInterpolation(hexA.r, hexB.r, t),
    s: linearInterpolation(hexA.s, hexB.s, t)
  };
};

export const getDistanceLine = (hexA, hexB, hexSize, hexOrigin) => {
  // Add safety checks
  if (!hexOrigin) {
    console.error("hexOrigin is undefined in getDistanceLine");
    return [];
  }
  
  const dist = cubeDistance(hexA, hexB);
  if (dist === 0) return [];
  
  const arr = [];
  
  for (let i = 0; i <= dist; i++) {
    const roundedHex = cubeRound(cubeLinearInt(hexA, hexB, (1.0 / dist) * i));
    const center = hexToPixel(roundedHex, hexSize, hexOrigin);
    arr.push(center);
  }
  
  return arr;
};

export const getHexCornerCoord = (center, i, hexSize) => {
  const angle_deg = 60 * i + 30;
  const angle_rad = (Math.PI / 180) * angle_deg;
  const x = center.x + hexSize * Math.cos(angle_rad);
  const y = center.y + hexSize * Math.sin(angle_rad);
  return { x, y };
};
