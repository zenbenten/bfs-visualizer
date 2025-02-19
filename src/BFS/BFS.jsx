import React, { Component } from 'react';
import './BFS.css';

export default class BFS extends Component {
    constructor(props) {
        super(props);

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            hexSize: 20,
            hexOrigin: { x: 400, y: 300},
            currentHex: { q: 0, r: 0, s: 0, x: 0, y: 0},
            playerPosition: { q: 0, r: 0, s: 0, x: 0, y: 0},
            canvasSize: { canvasWidth: 800, canvasHeight: 600 },
            hexParametres: null
        }
    }

    componentDidMount() {
        const hexParametres = this.getHexParametres();
        this.setState({ hexParametres }, () => {
            this.initializeCanvas();
            this.getCanvasPosition(this.canvasCoordinates);
            this.drawHexes();
            this.canvasCoordinates.width = this.state.canvasSize.canvasWidth;
            this.canvasCoordinates.height = this.state.canvasSize.canvasHeight;
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.currentHex !== this.state.currentHex) {
            const { x, y } = nextState.currentHex;
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctx = this.canvasCoordinates.getContext("2d");
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            let currentDistanceLine = nextState.currentDistanceLine;
            for (let i = 0; i < currentDistanceLine.length - 1; i++) {
                if (i == 0) {
                    this.drawHex(this.canvasCoordinates, { x: currentDistanceLine[i].x, y: currentDistanceLine[i].y },"black", 1, "red");
                }
                else {
                    this.drawHex(this.canvasCoordinates, { x: currentDistanceLine[i].x, y: currentDistanceLine[i].y }, "black", 1, "lime");
                }
            }
            const { q, r, s } = nextState.currentHex;
            //this.drawNeighbors(this.Hex(q, r, s));
            this.drawHex(this.canvasCoordinates, { x, y }, "lime", 2);
            return true;
        }
        return false;
    }

    initializeCanvas() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasHex.getContext('2d');

        // Clear and reset canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;

        // Set default drawing styles
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }

    getHexCornerCoord(center, i) {
        const angle_deg = 60 * i + 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        return {
            x: center.x + this.state.hexSize * Math.cos(angle_rad),
            y: center.y + this.state.hexSize * Math.sin(angle_rad)
        };
    }

    drawHex(canvas, center, lineColor, width, fillColor) {
        for (let i = 0; i <= 5; i++) {
            const start = this.getHexCornerCoord(center, i);
            const end = this.getHexCornerCoord(center, i + 1);
            this.fillHex(canvas, center, fillColor);
            this.drawLine(canvas, start, end, lineColor, width);
        }
    }

    drawLine(canvas, start, end, color, width) {
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    drawHexes() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const { hexSize, hexOrigin } = this.state;

        // Calculate vertical bounds considering hexagon height
        const hexHeight = 2 * hexSize;
        const maxY = canvasHeight - hexHeight / 2;  // Bottom edge
        const minY = hexHeight / 2;                 // Top edge

        // Calculate horizontal bounds considering hexagon width
        const hexWidth = Math.sqrt(3) * hexSize;
        const maxX = canvasWidth - hexWidth / 2;     // Right edge
        const minX = hexWidth / 2;                   // Left edge

        // Calculate row bounds (r-axis)
        const maxR = Math.floor((maxY - hexOrigin.y) / (hexSize * 1.5));
        const minR = Math.ceil((minY - hexOrigin.y) / (hexSize * 1.5));

        // Calculate column bounds for each row
        for (let r = minR; r <= maxR; r++) {
            const y = hexOrigin.y + r * hexSize * 1.5;

            // Calculate horizontal offset for this row
            const xOffset = (hexOrigin.x + (r % 2) * hexWidth / 2);

            // Calculate column range for this row
            const cols = Math.floor((canvasWidth - hexWidth / 2) / (hexWidth));
            const qMin = -cols;
            const qMax = cols;

            for (let q = qMin; q <= qMax; q++) {
                const center = {
                    x: xOffset + q * hexWidth,
                    y: y
                };

                // Check if hexagon is fully within canvas
                if (center.x >= minX && center.x <= maxX &&
                    center.y >= minY && center.y <= maxY) {
                    this.drawHex(this.canvasHex, center, "black", 1, "grey");
                    /*this.drawHexCoordinates(this.canvasHex, center, { 
                        q: q - Math.floor(r / 2), 
                        r: r,
                        s: -q - r + Math.floor(r / 2)
                    });*/
                }
            }
        }
    }

    isWithinCanvas(center) {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        return (
            center.x > -this.state.hexSize &&
            center.x < canvasWidth + this.state.hexSize &&
            center.y > -this.state.hexSize &&
            center.y < canvasHeight + this.state.hexSize
        );
    }

    hexToPixel(hex) {
        const { hexOrigin } = this.state;
        return {
            x: hexOrigin.x + this.state.hexSize * Math.sqrt(3) * (hex.q + hex.r/2),
            y: hexOrigin.y + this.state.hexSize * 3/2 * hex.r
        };
    }

    Hex(q, r, s) {
        return { q: q, r: r, s: s}
    }

    drawHexCoordinates(canvasID, center, h) {
        const ctx = canvasID.getContext("2d");
        ctx.fillText(h.q, center.x + 6, center.y);
        ctx.fillText(h.r, center.x - 3, center.y + 15);
        ctx.fillText(h.s, center.x - 12, center.y);
    }

    getHexParametres() {
        const hexHeight = this.state.hexSize * 2;
        const hexWidth = (Math.sqrt(3)/2) * hexHeight;
        return { 
            hexWidth,
            hexHeight,
            vertDist: hexHeight * 0.75,
            horizDist: hexWidth
        };
    }

    handleMouseMove(e) {
        const { left, right, top, bottom } = this.state.canvasPosition;
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const { hexWidth, hexHeight, vertDist, horizDist } = this.state.hexParametres;
        let offsetX = e.pageX - left;
        let offsetY = e.pageY - top;
        const { q, r, s } = this.cubeRound(this.pixelToHex({ x: offsetX, y: offsetY }));
        const { x, y } = this.hexToPixel(this.Hex(q, r, s));
        let playerPosition = this.state.playerPosition
        this.getDistanceLine(this.Hex(playerPosition.q, playerPosition.r, playerPosition.s), this.Hex(q,r,s));
        console.log(this.state.currentDistanceLine);
        if((x > hexWidth / 2 && x < canvasWidth - hexWidth / 2) && (y > hexHeight / 2 && y < canvasHeight - hexHeight/2)){
            this.setState({
                currentHex: { q, r, s, x, y }
            })
        }
    }

    getCanvasPosition(canvasID) {
        let rect = canvasID.getBoundingClientRect();
        this.setState({
            canvasPosition: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
        })
    }

    pixelToHex(p) {
        let size = this.state.hexSize;
        let origin = this.state.hexOrigin;
        let q = ((p.x - origin.x) * Math.sqrt(3)/3 - (p.y - origin.y) / 3) / size;
        let r = (p.y - origin.y) * 2/3 / size;
        return { q, r, s: -q - r }; // Return object directly instead of using Hex()
    }

    cubeRound(cube) {
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

        return { q: rx, r: ry, s: rz }; // Use object literal instead of Hex()
    }


    cubeDirections(direction) {
        const cubeDirections = [this.Hex(1, 0, -1), this.Hex(1, -1, 0), this.Hex(0, -1, 1), this.Hex(-1, 0, 1), this.Hex(-1, 1, 0), this.Hex(0, 1, -1)];
        return cubeDirections[direction];
    }

    cubeAdd(a, b) {
        return this.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }

    cubeSubtract(hexA, hexB) {
        return this.Hex(hexA.q - hexB.q, hexA.r - hexB.r, hexA.s - hexB.s);
    }

    getCubeNeighbor(h, direction) {
        return this.cubeAdd(h, this.cubeDirections(direction));
    }

    drawNeighbors(h) {
        for(let i = 0; i <= 5; i++) {
            const { q, r, s } = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
            const { x, y } = this.hexToPixel(this.Hex(q, r, s));
            this.drawHex(this.canvasCoordinates, { x, y }, "red", 2);
        }
    }

    cubeDistance(hexA, hexB) {
        const { q, r, s } = this.cubeSubtract(hexA, hexB);
        return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
    }

    linearInt(a, b, t) {
        return (a + (b - a) * t)
    }

    cubeLinearInt(hexA, hexB, t) {
        return this.Hex(this.linearInt(hexA.q, hexB.q, t), this.linearInt(hexA.r, hexB.r, t), this.linearInt(hexA.s, hexB.s, t));
    }

    getDistanceLine(hexA, hexB) {
        let dist = this.cubeDistance(hexA, hexB);
        var arr = [];
        for(let i = 0; i <= dist; i++) {
            let center = this.hexToPixel(this.cubeRound(this.cubeLinearInt(hexA, hexB, 1.0 / dist * i)));
            arr = [].concat(arr, center);
        }
        this.setState({
            currentDistanceLine: arr
        })
    }

    fillHex(canvasID, center, fillColor) {
        let c0 = this.getHexCornerCoord(center, 0);
        let c1 = this.getHexCornerCoord(center, 1);
        let c2 = this.getHexCornerCoord(center, 2);
        let c3 = this.getHexCornerCoord(center, 3);
        let c4 = this.getHexCornerCoord(center, 4);
        let c5 = this.getHexCornerCoord(center, 5);
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = 0.1;
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c4.x, c4.y);
        ctx.lineTo(c5.x, c5.y);
        ctx.closePath();
        ctx.fill();
    }

    handleClick() {
        this.setState({
            playerPosition: this.state.currentHex
        })
    }



    render() {
        return (
            <div className="BFS">
            <canvas ref={canvas => this.canvasHex = canvas}></canvas>
            <canvas ref={canvasCoordinates => this.canvasCoordinates = canvasCoordinates}
            onMouseMove = {this.handleMouseMove}
            onClick={this.handleClick}>
            </canvas>
            </div>
        );
    }
}
