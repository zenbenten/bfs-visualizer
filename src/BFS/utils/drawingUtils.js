// Drawing functions for the hex grid
import { Point } from './hexUtils';

export const getHexCornerCoord = (center, i, hexSize) => {
  const angle_deg = 60 * i + 30;
  const angle_rad = (Math.PI / 180) * angle_deg;
  const x = center.x + hexSize * Math.cos(angle_rad);
  const y = center.y + hexSize * Math.sin(angle_rad);
  return { x, y };
};

export const drawHex = (canvasContext, center, hexSize, lineColor, fillColor, alpha = 1.0) => {
  // Fill the hexagon first
  fillHex(canvasContext, center, hexSize, fillColor, alpha);

  // Then draw the outline
  for (let i = 0; i <= 5; i++) {
    const start = getHexCornerCoord(center, i, hexSize);
    const end = getHexCornerCoord(center, i + 1, hexSize);
    drawLine(canvasContext, start, end, 1, lineColor);
  }
};

export const drawLine = (canvasContext, start, end, lineWidth, lineColor) => {
  canvasContext.beginPath();
  canvasContext.moveTo(start.x, start.y);
  canvasContext.strokeStyle = lineColor;
  canvasContext.lineWidth = lineWidth;
  canvasContext.lineTo(end.x, end.y);
  canvasContext.stroke();
  canvasContext.closePath();
};

export const fillHex = (canvasContext, center, hexSize, fillColor, alpha = 1.0) => {
  const corners = [];
  for (let i = 0; i <= 5; i++) {
    corners.push(getHexCornerCoord(center, i, hexSize));
  }
  
  canvasContext.beginPath();
  canvasContext.fillStyle = fillColor;
  canvasContext.globalAlpha = alpha;
  canvasContext.moveTo(corners[0].x, corners[0].y);
  
  for (let i = 1; i <= 5; i++) {
    canvasContext.lineTo(corners[i].x, corners[i].y);
  }
  
  canvasContext.closePath();
  canvasContext.fill();
  canvasContext.globalAlpha = 1.0; // Reset alpha after drawing
};

export const clearCanvas = (canvas, width, height) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
};

export const drawHexCoordinates = (canvasContext, center, hex) => {
  canvasContext.fillText(hex.q, center.x + 6, center.y);
  canvasContext.fillText(hex.r, center.x - 3, center.y + 15);
  canvasContext.fillText(hex.s, center.x - 12, center.y);
};
