import React, {Component} from 'react';

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
        this.obstaclesRef = React.createRef();
        this.obstaclesRef.current = new Set(WALLS);

        // Bindings for methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // (Optional) Throttling variables – may be removed since optimized handling is used now
        this.lastRightDragHex = null;
        this.lastRightDragTime = 0;

        this.state = {
            hexSize: 20,
            hexOrigin: { x: 400, y: 300 },
            currentHex: { q: 0, r: 0, s: 0, x: 0, y: 0 },
            playerPosition: { q: 0, r: 0, s: 0, x: 400, y: 300 },
            obstacles: WALLS, // For initialization only
            cameFrom: {},
            hexPathMap: [],
            path: [],
            isRightMouseDown: false
        };
    }

    componentWillMount() {
        let hexParametres = this.getHexParametres();
        this.setState({
            canvasSize: { canvasWidth: 800, canvasHeight: 600 },
            hexParametres: hexParametres
        });
    }

    componentWillUnmount() {
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    componentDidMount() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        window.addEventListener("mouseup", this.handleMouseUp);
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;
        this.canvasInteraction.width = canvasWidth;
        this.canvasInteraction.height = canvasHeight;
        this.canvasView.width = canvasWidth;
        this.canvasView.height = canvasHeight;
        this.getCanvasPosition(this.canvasInteraction);
        this.drawHex(
            this.canvasInteraction,
            this.Point(this.state.playerPosition.x, this.state.playerPosition.y),
            1,
            "grey",
            "red",
            0.2
        );
        this.drawHexes();
        this.drawObstacles();

        // Initialize BFS on component mount
        this.breadthFirstSearch(this.state.playerPosition);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.currentHex !== this.state.currentHex) {
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctx = this.canvasInteraction.getContext("2d");
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            this.drawPath(); // Keep this to show filled hexagons
            this.drawObstacles();
            return true;
        }
        if (nextState.cameFrom !== this.state.cameFrom) {
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctx = this.canvasView.getContext("2d");
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Keep the hexagon filling but remove the arrow drawing
            for (let l in nextState.cameFrom) {
                const { q, r, s } = JSON.parse(l);
                const { x, y } = this.hexToPixel(this.Hex(q, r, s));
                this.drawHex(this.canvasView, this.Point(x, y), 1, "black", "SkyBlue", 0.1);

                // Remove these two lines that draw the arrows
                // var from = JSON.parse(nextState.cameFrom[l]);
                // var fromCoord = this.hexToPixel(this.Hex(from.q, from.r, from.s));
                // this.drawArrow(fromCoord.x, fromCoord.y, x, y);
            }

            return true;
        }
        return false;
    }

    drawHexes() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasHex.getContext("2d");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Set consistent line properties
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";

        const { hexWidth, hexHeight, vertDist, horizDist } = this.state.hexParametres;
        const hexOrigin = this.state.hexOrigin;
        let qLeftSide = Math.round(hexOrigin.x / horizDist);
        let qRightSide = Math.round((canvasWidth - hexOrigin.x) / horizDist);
        let rTopSide = Math.round(hexOrigin.y / vertDist);
        let rBottomSide = Math.round((canvasHeight - hexOrigin.y) / vertDist);
        var hexPathMap = [];
        var p = 0;
        for (let r = 0; r <= rBottomSide; r++) {
            if (r % 2 === 0 && r !== 0) {
                p++;
            }
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                const hex = this.Hex(q - p, r, -(q - p) - r);
                const { x, y } = this.hexToPixel(hex);
                if (
                    x > hexWidth / 2 &&
                    x < canvasWidth - hexWidth / 2 &&
                    y > hexHeight / 2 &&
                    y < canvasHeight - hexHeight / 2
                ) {
                    this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "SkyBlue");
                    hexPathMap.push(JSON.stringify(hex));
                }
            }
        }
        var n = 0;
        for (let r = -1; r >= -rTopSide; r--) {
            if (r % 2 !== 0) {
                n++;
            }
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                const hex = this.Hex(q + n, r, -(q + n) - r);
                const { x, y } = this.hexToPixel(hex);
                if (
                    x > hexWidth / 2 &&
                    x < canvasWidth - hexWidth / 2 &&
                    y > hexHeight / 2 &&
                    y < canvasHeight - hexHeight / 2
                ) {
                    this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "SkyBlue");
                    hexPathMap.push(JSON.stringify(hex));
                }
            }
        }
        this.setState({ hexPathMap });
    }

    drawHex(canvasID, center, lineWidth, lineColor, fillColor) {
        // Always use a consistent line width
        const standardLineWidth = 1; 

        // Fill the hexagon first
        this.fillHex(canvasID, center, fillColor);

        // Then draw the outline with consistent width
        for (let i = 0; i <= 5; i++) {
            let start = this.getHexCornerCoord(center, i);
            let end = this.getHexCornerCoord(center, i + 1);
            this.drawLine(canvasID, start, end, standardLineWidth, lineColor);
        }
    }

    getHexCornerCoord(center, i) {
        let angle_deg = 60 * i + 30;
        let angle_rad = (Math.PI / 180) * angle_deg;
        let x = center.x + this.state.hexSize * Math.cos(angle_rad);
        let y = center.y + this.state.hexSize * Math.sin(angle_rad);
        return this.Point(x, y);
    }

    getHexParametres() {
        let hexHeight = this.state.hexSize * 2;
        let hexWidth = (Math.sqrt(3) / 2) * hexHeight;
        let vertDist = (hexHeight * 3) / 4;
        let horizDist = hexWidth;
        return { hexWidth, hexHeight, vertDist, horizDist };
    }

    getCanvasPosition(canvasID) {
        let rect = canvasID.getBoundingClientRect();
        this.setState({
            canvasPosition: {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom
            }
        });
    }

    hexToPixel(h) {
        let hexOrigin = this.state.hexOrigin;
        let x =
            this.state.hexSize *
                Math.sqrt(3) *
                (h.q + h.r / 2) +
            hexOrigin.x;
        let y =
            (this.state.hexSize * 3) / 2 * h.r +
            hexOrigin.y;
        return this.Point(x, y);
    }

    pixelToHex(p) {
        let size = this.state.hexSize;
        let origin = this.state.hexOrigin;
        let q =
            ((p.x - origin.x) * Math.sqrt(3) / 3 -
                (p.y - origin.y) / 3) /
            size;
        let r = ((p.y - origin.y) * 2) / (3 * size);
        return this.Hex(q, r, -q - r);
    }

    cubeDirection(direction) {
        const cubeDirections = [
            this.Hex(1, 0, -1),
            this.Hex(1, -1, 0),
            this.Hex(0, -1, 1),
            this.Hex(-1, 0, 1),
            this.Hex(-1, 1, 0),
            this.Hex(0, 1, -1)
        ];
        return cubeDirections[direction];
    }

    cubeAdd(a, b) {
        return this.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }

    cubeSubstract(hexA, hexB) {
        return this.Hex(
            hexA.q - hexB.q,
            hexA.r - hexB.r,
            hexA.s - hexB.s
        );
    }

    getCubeNeighbor(h, direction) {
        return this.cubeAdd(h, this.cubeDirection(direction));
    }

    getNeighbors(h) {
        var arr = [];
        for (let i = 0; i <= 5; i++) {
            const { q, r, s } = this.getCubeNeighbor(
                this.Hex(h.q, h.r, h.s),
                i
            );
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
            let center = this.hexToPixel(
                this.cubeRound(
                    this.cubeLinearInt(hexA, hexB, (1.0 / dist) * i)
                )
            );
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
        return this.Hex(
            this.linearInt(hexA.q, hexB.q, t),
            this.linearInt(hexA.r, hexB.r, t),
            this.linearInt(hexA.s, hexB.s, t)
        );
    }

    linearInt(a, b, t) {
        return a + (b - a) * t;
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
        ctx.globalAlpha = 1;
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
            const { q, r, s } = this.getCubeNeighbor(
                this.Hex(h.q, h.r, h.s),
                i
            );
            const { x, y } = this.hexToPixel(this.Hex(q, r, s));
            this.drawHex(
                this.canvasInteraction,
                this.Point(x, y),
                1,
                "black",
                "red"
            );
        }
    }

    handleMouseMove(e) {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const { hexWidth, hexHeight } = this.state.hexParametres;
        const { left, top } = this.state.canvasPosition;
        var canvasPos = document.getElementById("canv7");
        let rect = canvasPos.getBoundingClientRect();
        let offsetX = e.pageX - rect.left;
        let offsetY = e.pageY - (window.pageYOffset + rect.top);
        const { q, r, s } = this.cubeRound(
            this.pixelToHex(this.Point(offsetX, offsetY))
        );
        const { x, y } = this.hexToPixel(this.Hex(q, r, s));
        let playerPosition = this.state.playerPosition;
        this.getDistanceLine(this.Hex(0, 0, 0), this.Hex(q, r, s));
        this.getPath(
            this.Hex(playerPosition.q, playerPosition.r, playerPosition.s),
            this.Hex(q, r, s)
        );

        if (
            x > hexWidth / 2 &&
            x < canvasWidth - hexWidth / 2 &&
            y > hexHeight / 2 &&
            y < canvasHeight - hexHeight / 2
        ) {
            this.setState({
                currentHex: { q, r, s, x, y }
            });
        }

        // Optimized wall handling using obstaclesRef
        if (this.state.isRightMouseDown) {
            const hexStr = JSON.stringify(this.Hex(q, r, s));
            if (hexStr === this.lastRightDragHex) return;
            this.lastRightDragHex = hexStr;

            const ctx = this.canvasInteraction.getContext("2d");
            if (!this.obstaclesRef.current.has(hexStr)) {
                // Add wall
                this.obstaclesRef.current.add(hexStr);
                this.drawHex(this.canvasInteraction, this.Point(x, y), 1, "black", "grey");
            } else {
                // Remove wall
                this.obstaclesRef.current.delete(hexStr);
                this.drawHex(this.canvasInteraction, this.Point(x, y), 1, "black", "SkyBlue");
            }
            this.breadthFirstSearch(this.state.playerPosition);
        }
    }

    getPath(start, current) {
        const { cameFrom } = this.state;
        start = JSON.stringify(start);
        current = JSON.stringify(current);

        if (!cameFrom[current] || !cameFrom[start]) return;

        let path = [current];
        let safetyCounter = 0;
        const maxSteps = 1000;

        while (current !== start && safetyCounter < maxSteps) {
            current = cameFrom[current];
            if (!current) break;
            path.push(current);
            safetyCounter++;
        }

        if (safetyCounter >= maxSteps) {
            console.warn("Pathfinding exceeded maximum steps");
            return;
        }

        this.setState({
            path: path.reverse()
        });
    }

    drawPath() {
        let path = this.state.path;
        for (let i = 0; i <= path.length - 1; i++) {
            const { q, r } = JSON.parse(path[i]);
            const { x, y } = this.hexToPixel(this.Hex(q, r, -q - r));
            this.drawHex(this.canvasInteraction, this.Point(x, y), 1, "black", "red");
        }
    }

    /*drawArrow(fromx, fromy, tox, toy) {
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
        ctx.globalAlpha = 3;
        ctx.lineTo(
            tox - headlen * Math.cos(angle - Math.PI / 7),
            toy - headlen * Math.sin(angle - Math.PI / 7)
        );
        ctx.lineTo(
            tox - headlen * Math.cos(angle + Math.PI / 7),
            toy - headlen * Math.sin(angle + Math.PI / 7)
        );
        ctx.lineTo(tox, toy);
        ctx.lineTo(
            tox - headlen * Math.cos(angle - Math.PI / 7),
            toy - headlen * Math.sin(angle - Math.PI / 7)
        );
        ctx.strokeStyle = "#cc0000";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fillStyle = "#cc0000";
        ctx.fill();
    }*/

        handleClick() {
            const { currentHex } = this.state;
            const { q, r, s } = currentHex;
            const hexStr = JSON.stringify(this.Hex(q, r, s));

            // Don't allow moving to obstacles
            if (this.obstaclesRef.current.has(hexStr)) {
                return;
            }

            // Clear all canvases completely
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctxHex = this.canvasHex.getContext("2d");
            const ctxInteraction = this.canvasInteraction.getContext("2d");
            const ctxView = this.canvasView.getContext("2d");

            ctxHex.clearRect(0, 0, canvasWidth, canvasHeight);
            ctxInteraction.clearRect(0, 0, canvasWidth, canvasHeight);
            ctxView.clearRect(0, 0, canvasWidth, canvasHeight);

            // Update player position unconditionally
            this.setState(
                {
                    path: [],
                    playerPosition: this.Hex(q, r, s)
                },
                () => {
                    // Redraw everything from scratch
                    this.drawHexes();
                    this.breadthFirstSearch(this.state.playerPosition);
                    this.drawObstacles();

                    // Draw the player position
                    const { x, y } = this.hexToPixel(this.state.playerPosition);
                    this.drawHex(
                        this.canvasInteraction,
                        this.Point(x, y),
                        1,
                        "grey",
                        "red",
                        0.2
                    );
                }
            );
        }

    handleRightClick(e) {
        e.preventDefault();
        this.setState({ isRightMouseDown: true });
        const canvasPos = document.getElementById("canv7");
        const rect = canvasPos.getBoundingClientRect();
        const offsetX = e.pageX - rect.left;
        const offsetY = e.pageY - (window.pageYOffset + rect.top);
        const hex = this.cubeRound(
            this.pixelToHex(this.Point(offsetX, offsetY))
        );
        const hexStr = JSON.stringify(hex);

        this.setState(
            prevState => {
                let newObstacles;
                if (prevState.obstacles.includes(hexStr)) {
                    newObstacles = prevState.obstacles.filter(o => o !== hexStr);
                } else {
                    newObstacles = [...prevState.obstacles, hexStr];
                }
                return { obstacles: newObstacles };
            },
            () => {
                const ctx = this.canvasHex.getContext("2d");
                ctx.clearRect(
                    0,
                    0,
                    this.state.canvasSize.canvasWidth,
                    this.state.canvasSize.canvasHeight
                );
                this.drawHexes();
                this.drawObstacles();
                this.breadthFirstSearch(this.state.playerPosition);
            }
        );
    }

    handleMouseUp = (e) => {
        if (e.button === 2) {
            this.setState({
                obstacles: Array.from(this.obstaclesRef.current),
                isRightMouseDown: false
            });
            this.lastRightDragHex = null;
            this.lastRightDragTime = 0;
        }
    };

    drawSingleObstacle(hexStr, lineColor, fillColor) {
        const { q, r, s } = JSON.parse(hexStr);
        const { x, y } = this.hexToPixel(this.Hex(q, r, s));
        this.drawHex(this.canvasInteraction, this.Point(x, y), 1, lineColor, fillColor);
    }

    drawSingleHex(hexStr, color) {
        const { q, r, s } = JSON.parse(hexStr);
        const { x, y } = this.hexToPixel(this.Hex(q, r, s));
        this.drawHex(this.canvasInteraction, this.Point(x, y), 1, "yellow", color);
    }

    // Update drawObstacles to use canvasInteraction
    drawObstacles() {
        this.obstaclesRef.current.forEach(hexStr => {
            this.drawSingleObstacle(hexStr, "black", "grey");
        });
    }

    breadthFirstSearch(playerPosition) {
        const { hexPathMap } = this.state;
        const frontier = [playerPosition];
        const cameFrom = { [JSON.stringify(playerPosition)]: JSON.stringify(playerPosition) };

        while (frontier.length > 0) {
            const current = frontier.shift();
            this.getNeighbors(current).forEach(neighbor => {
                const neighborStr = JSON.stringify(neighbor);
                if (
                    !cameFrom[neighborStr] &&
                    hexPathMap.includes(neighborStr) &&
                    !this.obstaclesRef.current.has(neighborStr)
                ) {
                    frontier.push(neighbor);
                    cameFrom[neighborStr] = JSON.stringify(current);
                }
            });
        }

        this.setState({ cameFrom });
    }

    resetSketch() {
        window.location.reload();
    }

    render() {
        return (
            <div className="BFSExtra">
            <div className="canvasWrapper">
            <canvas id="canv8" ref={canvasHex => (this.canvasHex = canvasHex)}></canvas>
            <canvas id="canv7" ref={canvasCoordinates => (this.canvasCoordinates = canvasCoordinates)}></canvas>
            <canvas id="canv6" ref={canvasView => (this.canvasView = canvasView)}></canvas>
            <canvas
            id="canv1"
            ref={canvasInteraction => (this.canvasInteraction = canvasInteraction)}
            onMouseMove={this.handleMouseMove}
            onClick={this.handleClick}
            onContextMenu={this.handleRightClick}
            ></canvas>
            </div>
            </div>
        );
    }
}
