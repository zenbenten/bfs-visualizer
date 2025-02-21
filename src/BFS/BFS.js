import React, { Component } from 'react';

var WALLS = [ 
    '{"q":5,"r":-9,"s":4}', '{"q":6,"r":-9,"s":3}', 
    '{"q":7,"r":-9,"s":2}', '{"q":8,"r":-9,"s":1}', 
    '{"q":9,"r":-9,"s":0}', '{"q":10,"r":-9,"s":-1}', 
    '{"q":11,"r":-9,"s":-2}', '{"q":12,"r":-9,"s":-3}', 
    '{"q":13,"r":-9,"s":-4}', '{"q":14,"r":-9,"s":-5}', 
    '{"q":15,"r":-9,"s":-6}', '{"q":15,"r":-8,"s":-7}', 
    '{"q":14,"r":-7,"s":-7}', '{"q":14,"r":-6,"s":-8}', 
    '{"q":13,"r":-5,"s":-8}', '{"q":13,"r":-4,"s":-9}', 
    '{"q":12,"r":-3,"s":-9}', '{"q":12,"r":-2,"s":-10}', 
    '{"q":11,"r":-1,"s":-10}', '{"q":11,"r":0,"s":-11}', 
    '{"q":10,"r":1,"s":-11}', '{"q":10,"r":2,"s":-12}', 
    '{"q":9,"r":3,"s":-12}', '{"q":9,"r":4,"s":-13}', 
    '{"q":8,"r":5,"s":-13}', '{"q":8,"r":6,"s":-14}', 
    '{"q":7,"r":7,"s":-14}', '{"q":7,"r":8,"s":-15}', 
    '{"q":6,"r":9,"s":-15}', '{"q":5,"r":9,"s":-14}', 
    '{"q":4,"r":9,"s":-13}', '{"q":3,"r":9,"s":-12}', 
    '{"q":2,"r":9,"s":-11}', '{"q":1,"r":9,"s":-10}', 
    '{"q":0,"r":9,"s":-9}', '{"q":-1,"r":9,"s":-8}', 
    '{"q":-2,"r":9,"s":-7}', '{"q":-3,"r":9,"s":-6}', 
    '{"q":-4,"r":9,"s":-5}', '{"q":-5,"r":9,"s":-4}', 
    '{"q":-12,"r":2,"s":10}', '{"q":-12,"r":3,"s":9}', 
    '{"q":-13,"r":4,"s":9}', '{"q":-13,"r":5,"s":8}', 
    '{"q":-14,"r":6,"s":8}', '{"q":-14,"r":7,"s":7}', 
    '{"q":-15,"r":8,"s":7}', '{"q":-15,"r":9,"s":6}', 
    '{"q":-14,"r":9,"s":5}', '{"q":-13,"r":9,"s":4}', 
    '{"q":-12,"r":9,"s":3}', '{"q":-11,"r":9,"s":2}', 
    '{"q":-10,"r":9,"s":1}', '{"q":-9,"r":9,"s":0}', 
    '{"q":-8,"r":9,"s":-1}', '{"q":-7,"r":9,"s":-2}', 
    '{"q":-6,"r":9,"s":-3}', '{"q":-11,"r":1,"s":10}', 
    '{"q":-11,"r":0,"s":11}', '{"q":-10,"r":-1,"s":11}', 
    '{"q":-10,"r":-2,"s":12}', '{"q":-9,"r":-3,"s":12}', 
    '{"q":-9,"r":-4,"s":13}', '{"q":-8,"r":-5,"s":13}', 
    '{"q":-8,"r":-6,"s":14}', '{"q":-7,"r":-7,"s":14}', 
    '{"q":-7,"r":-8,"s":15}', '{"q":-6,"r":-9,"s":15}', 
    '{"q":-5,"r":-9,"s":14}', '{"q":-4,"r":-9,"s":13}', 
    '{"q":-3,"r":-9,"s":12}', '{"q":-2,"r":-9,"s":11}', 
    '{"q":-1,"r":-9,"s":10}', '{"q":0,"r":-9,"s":9}', 
    '{"q":1,"r":-9,"s":8}', '{"q":2,"r":-9,"s":7}', 
    '{"q":3,"r":-9,"s":6}', '{"q":4,"r":-9,"s":5}'
];

export default class BreadthFirstSearch extends React.Component {
    constructor(props) {
        super(props);
        // For tracking the last toggled hex to avoid duplicate toggles
        this.lastToggledHex = null;
        // Use a ref (Set) for fast lookup and updates of obstacles
        this.obstaclesRef = new Set(WALLS);

        // Bind the new mouse event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.state = {
            hexSize: 20,
            hexOrigin: { x: 400, y: 300 },
            currentHex: { q: 0, r: 0, s: 0, x: 0, y: 0 },
            playerPosition: { q: 0, r: 0, s: 0, x: 400, y: 300 },
            // obstacles in state are synced on mouseup
            obstacles: WALLS,
            cameFrom: {},
            hexPathMap: [],
            path: [],
            // Boolean flag indicating whether right mouse button (toggling) is active
            isRightMouseDown: false
        }
    }

    componentWillMount(){
        let hexParametres = this.getHexParametres();
        this.setState({
            canvasSize: { canvasWidth: 800, canvasHeight: 600 },
            hexParametres: hexParametres
        });
    }

    componentDidMount(){
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        window.addEventListener("mouseup", this.handleMouseUp);
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;
        this.canvasInteraction.width = canvasWidth;
        this.canvasInteraction.height = canvasHeight;
        this.canvasView.width = canvasWidth;
        this.canvasView.height = canvasHeight;
        this.getCanvasPosition(this.canvasInteraction);
        this.drawHex(this.canvasInteraction, this.Point(this.state.playerPosition.x, this.state.playerPosition.y), 1, "grey", "red", 0.2);
        this.drawHexes();
        this.drawObstacles();
    }

    componentWillUnmount() {
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.currentHex !== this.state.currentHex) {
            const { q, r, s, x, y } = nextState.currentHex;
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctx = this.canvasInteraction.getContext("2d");
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            this.drawPath();
            return true;
        }
        if(nextState.cameFrom !== this.state.cameFrom) {
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctx = this.canvasView.getContext("2d");
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            for (let l in nextState.cameFrom) {
                const { q, r, s } = JSON.parse(l);
                const { x, y } = this.hexToPixel(this.Hex(q, r));
                this.drawHex(this.canvasView, this.Point(x, y), 1, "black", "orange", 0.1);
                var from = JSON.parse(nextState.cameFrom[l]);
                var fromCoord = this.hexToPixel(this.Hex(from.q, from.r));
                this.drawArrow(fromCoord.x, fromCoord.y, x, y);
            }
            return true;
        }
        return false;
    }

    drawHexes() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasHex.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const { hexWidth, hexHeight, vertDist, horizDist } = this.state.hexParametres;
        const hexOrigin = this.state.hexOrigin;
        let qLeftSide = Math.round(hexOrigin.x / horizDist);
        let qRightSide = Math.round((canvasWidth - hexOrigin.x) / horizDist);
        let rTopSide = Math.round(hexOrigin.y / vertDist);
        let rBottomSide = Math.round((canvasHeight - hexOrigin.y) / vertDist);
        var hexPathMap = [];
        var p = 0;
        for (let r = 0; r <= rBottomSide; r++) {
            if(r % 2 === 0 && r !== 0) {
                p++;
            }
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                const { x, y } = this.hexToPixel(this.Hex(q - p, r));
                if ((x > hexWidth/2 && x < canvasWidth - hexWidth/2) && (y > hexHeight/2 && y < canvasHeight - hexHeight/2)) {
                    this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "grey");
                    var bottomH = JSON.stringify(this.Hex(q - p, r, -(q - p) - r));
                    if (!this.obstaclesRef.has(bottomH)) {
                        hexPathMap.push(bottomH);
                    }
                }
            }
        }
        var n = 0;
        for (let r = -1; r >= -rTopSide; r--) {
            if(r % 2 !== 0) {
                n++;
            }
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                const { x, y } = this.hexToPixel(this.Hex(q + n, r));
                if ((x > hexWidth/2 && x < canvasWidth - hexWidth/2) && (y > hexHeight/2 && y < canvasHeight - hexHeight/2)) {
                    this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "grey");
                    var topH = JSON.stringify(this.Hex(q + n, r, -(q + n) - r));
                    if (!this.obstaclesRef.has(topH)) {
                        hexPathMap.push(topH);
                    }
                }
            }
        }
        hexPathMap = [].concat(hexPathMap);
        this.setState(
            { hexPathMap: hexPathMap },
            this.breadthFirstSearchCallback = () => this.breadthFirstSearch(this.state.playerPosition)
        );
    }

    // Draws a hex by drawing its six sides and filling it
    drawHex(canvasID, center, lineWidth, lineColor, fillColor) {
        for (let i = 0; i <= 5; i++) {
            let start = this.getHexCornerCoord(center, i);
            let end = this.getHexCornerCoord(center, i + 1);
            this.fillHex(canvasID, center, fillColor);
            this.drawLine(canvasID, start, end, lineWidth, lineColor);
        }
    }

    getHexCornerCoord(center, i) {
        let angle_deg = 60 * i + 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        let x = center.x + this.state.hexSize * Math.cos(angle_rad);
        let y = center.y + this.state.hexSize * Math.sin(angle_rad);
        return this.Point(x, y);
    }

    getHexParametres() {
        let hexHeight = this.state.hexSize * 2;
        let hexWidth = Math.sqrt(3) / 2 * hexHeight;
        let vertDist = hexHeight * 3 / 4;
        let horizDist = hexWidth;
        return { hexWidth, hexHeight, vertDist, horizDist };
    }

    getCanvasPosition(canvasID) {
        let rect = canvasID.getBoundingClientRect();
        this.setState({
            canvasPosition: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
        });
    }

    hexToPixel(h) {
        let hexOrigin = this.state.hexOrigin;
        let x = this.state.hexSize * Math.sqrt(3) * (h.q + h.r / 2) + hexOrigin.x;
        let y = this.state.hexSize * 3 / 2 * h.r + hexOrigin.y;
        return this.Point(x, y);
    }

    pixelToHex(p) {
        let size = this.state.hexSize;
        let origin = this.state.hexOrigin;
        let q = ((p.x - origin.x) * Math.sqrt(3) / 3 - (p.y - origin.y) / 3) / size;
        let r = (p.y - origin.y) * 2 / 3 / size;
        return this.Hex(q, r, -q - r);
    }

    cubeDirection(direction) {
        const cubeDirections = [this.Hex(1, 0, -1), this.Hex(1, -1, 0), this.Hex(0, -1, 1),
            this.Hex(-1, 0, 1), this.Hex(-1, 1, 0), this.Hex(0, 1, -1)];
        return cubeDirections[direction];
    }

    cubeAdd(a, b) {
        return this.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }

    cubeSubstract(hexA, hexB) {
        return this.Hex(hexA.q - hexB.q, hexA.r - hexB.r, hexA.s - hexB.s);
    }

    getCubeNeighbor(h, direction) {
        return this.cubeAdd(h, this.cubeDirection(direction));
    }

    getNeighbors(h) {
        var arr = [];
        for (let i = 0; i <= 5; i++) {
            const { q, r, s } = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
            arr.push(this.Hex(q, r, s));
        }
        return arr;
    }

    cubeRound(cube) {
        var rx = Math.round(cube.q);
        var ry = Math.round(cube.r);
        var rz = Math.round(cube.s);
        var x_diff = Math.abs(rx - cube.q);
        var y_diff = Math.abs(ry - cube.r);
        var z_diff = Math.abs(rz - cube.s);
        if (x_diff > y_diff && x_diff > z_diff) {
            rx = -ry - rz;
        } else if (y_diff > z_diff) {
            ry = -rx - rz;
        } else {
            rz = -rx - ry;
        }
        return this.Hex(rx, ry, rz);
    }

    getDistanceLine(hexA, hexB) {
        let dist = this.cubeDistance(hexA, hexB);
        var arr = [];
        for (let i = 0; i <= dist; i++) {
            let center = this.hexToPixel(this.cubeRound(this.cubeLinearInt(hexA, hexB, 1.0 / dist * i)));
            arr = [].concat(arr, center);
        }
        this.setState({
            currentDistanceLine: arr
        });
    }

    cubeDistance(hexA, hexB) {
        const { q, r, s } = this.cubeSubstract(hexA, hexB);
        return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
    }

    cubeLinearInt(hexA, hexB, t) {
        return this.Hex(this.linearInt(hexA.q, hexB.q, t), this.linearInt(hexA.r, hexB.r, t), this.linearInt(hexA.s, hexB.s, t));
    }

    linearInt(a, b, t) {
        return (a + (b - a) * t);
    }

    Point(x, y) {
        return { x: x, y: y };
    }

    Hex(q, r, s) {
        return { q: q, r: r, s: s };
    }

    drawLine(canvasID, start, end, lineWidth, lineColor) {
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
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

    drawHexCoordinates(canvasID, center, h) {
        const ctx = canvasID.getContext("2d");
        ctx.fillText(h.q, center.x + 6, center.y);
        ctx.fillText(h.r, center.x - 3, center.y + 15);
        ctx.fillText(h.s, center.x - 12, center.y);
    }

    drawNeighbors(h) {
        for (let i = 0; i <= 5; i++) {
            const { q, r, s } = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
            const { x, y } = this.hexToPixel(this.Hex(q, r, s));
            this.drawHex(this.canvasInteraction, this.Point(x, y), "red", 2);
        }
    }

    // Helper: extracts the hex corresponding to the mouse event coordinates.
    getHexFromEvent(e) {
        let rect = this.canvasInteraction.getBoundingClientRect();
        let offsetX = e.pageX - rect.left;
        let offsetY = e.pageY - (window.pageYOffset + rect.top);
        return this.cubeRound(this.pixelToHex(this.Point(offsetX, offsetY)));
    }

    // onMouseDown: When right-click is pressed, toggle the hex under the pointer and enable toggling.
    handleMouseDown(e) {
        if(e.button === 2) { // right click
            this.setState({ isRightMouseDown: true });
            const hex = this.getHexFromEvent(e);
            const hexStr = JSON.stringify(hex);
            if(this.obstaclesRef.has(hexStr)) {
                this.obstaclesRef.delete(hexStr);
            } else {
                this.obstaclesRef.add(hexStr);
            }
            this.lastToggledHex = hexStr;
            // Immediately update the canvas (without running BFS yet)
            this.drawHexes();
            this.drawObstacles();
        }
    }

    // onMouseMove (acting as our "mouseenter") toggles additional hexes only while toggling is active.
    handleMouseEnter(e) {
        if(this.state.isRightMouseDown) {
            const hex = this.getHexFromEvent(e);
            const hexStr = JSON.stringify(hex);
            if(hexStr !== this.lastToggledHex) {
                if(this.obstaclesRef.has(hexStr)) {
                    this.obstaclesRef.delete(hexStr);
                } else {
                    this.obstaclesRef.add(hexStr);
                }
                this.lastToggledHex = hexStr;
                // Update canvas obstacles immediately; do not run BFS here.
                this.drawHexes();
                this.drawObstacles();
            }
        } else {
            // When not toggling, simply update the current hex for display purposes.
            const hex = this.getHexFromEvent(e);
            const { x, y } = this.hexToPixel(hex);
            this.setState({ currentHex: { ...hex, x, y } });
        }
    }

    // onMouseUp: Disable toggling mode and then run BFS collision detection.
    handleMouseUp(e) {
        if(e.button === 2) {
            this.setState({ isRightMouseDown: false });
            this.lastToggledHex = null;
            // Now update BFS and sync obstacles state.
            this.breadthFirstSearch(this.state.playerPosition);
            this.setState({ obstacles: Array.from(this.obstaclesRef) });
        }
    }

    drawPath() {
        let path = this.state.path;
        for (let i = 0; i <= path.length - 1; i++) {
            const { q, r } = JSON.parse(path[i]);
            const { x, y } = this.hexToPixel(this.Hex(q, r));
            this.drawHex(this.canvasInteraction, this.Point(x, y), 1, "black", "red");
        }
    }

    drawArrow(fromx, fromy, tox, toy) {
        var ctx = this.canvasView.getContext("2d");
        var headlen = 5;
        var angle = Math.atan2(toy - fromy, tox - fromx);
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = "#cc0000";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.globalAlpha = 0.3;
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
        ctx.strokeStyle = "#cc0000";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fillStyle = "#cc0000";
        ctx.fill();
    }

    handleClick() {
        const { currentHex, cameFrom } = this.state;
        const { q, r, s } = currentHex;

        if (cameFrom[JSON.stringify(this.Hex(q, r, s))]) {
            this.setState(
                {
                    path: [],
                    playerPosition: this.Hex(q, r, s)
                },
                () => {
                    const ctx = this.canvasInteraction.getContext("2d");
                    ctx.clearRect(0, 0, this.state.canvasSize.canvasWidth, this.state.canvasSize.canvasHeight);
                    this.breadthFirstSearch(this.state.playerPosition);
                }
            );
        }
    }

    breadthFirstSearch(playerPosition) {
        var frontier = [playerPosition];
        var cameFrom = {};
        cameFrom[JSON.stringify(playerPosition)] = JSON.stringify(playerPosition);
        while (frontier.length !== 0) {
            var current = frontier.shift();
            let arr = this.getNeighbors(current);
            arr.forEach(l => {
                if (!cameFrom.hasOwnProperty(JSON.stringify(l)) && 
                    this.state.hexPathMap.includes(JSON.stringify(l))) {
                    frontier.push(l);
                    cameFrom[JSON.stringify(l)] = JSON.stringify(current);
                }
            });
        }
        cameFrom = Object.assign({}, cameFrom);
        this.setState({
            cameFrom: cameFrom
        });
    }

    resetSketch() {
        window.location.reload();
    }

    render() {
        return (
            <div className="BFSExtra">
                <div className="canvasWrapper">
                    <canvas id="canv8" ref={canvasHex => this.canvasHex = canvasHex}></canvas>
                    <canvas id="canv7" ref={canvasCoordinates => this.canvasCoordinates = canvasCoordinates}></canvas>
                    <canvas id="canv6" ref={canvasView => this.canvasView = canvasView}></canvas>
                    <canvas 
                        id="canv1" 
                        ref={canvasInteraction => this.canvasInteraction = canvasInteraction} 
                        onMouseDown={this.handleMouseDown}
                        onMouseMove={this.handleMouseEnter}
                        onMouseUp={this.handleMouseUp}
                        onContextMenu={(e) => e.preventDefault()}
                    ></canvas>
                </div>
            </div>
        );
    }
}

