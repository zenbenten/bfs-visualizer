import React, { Component, createRef } from 'react';
import { WALLS } from './walls';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import { 
    hexToPixel, pixelToHex, cubeRound, Hex, Point, 
    getDistanceLine, getNeighbors
} from './utils/hexUtils';
import {
    drawHex, clearCanvas, drawHexCoordinates
} from './utils/drawingUtils';
import {
    breadthFirstSearch, getPath
} from './utils/pathfinding';
import './BFS.css';

export default class BreadthFirstSearch extends Component {
    constructor(props) {
        super(props);
        this.originalWalls = new Set(WALLS);
        this.obstaclesRef = createRef();
        this.obstaclesRef.current = new Set(WALLS);

        // Animation related variables
        this.animationFrameId = null;
        this.animationSpeed = 15; // Speed of animation (lower = faster)

        // Canvas refs
        this.canvasHex = createRef();
        this.canvasView = createRef();
        this.canvasInteraction = createRef();
        this.canvasCoordinates = createRef();

        // Calculate the initial pixel position for the player
        const hexOrigin = { x: 400, y: 300 };
        const playerHex = { q: 0, r: 0, s: 0 };
        const playerPixel = {
            x: hexOrigin.x,
            y: hexOrigin.y
        };

        // Throttling variables
        this.lastRightDragHex = null;
        this.lastRightDragTime = 0;
        this.lastWallUpdateTime = 0; 

        this.state = {
            hexSize: 20,
            hexOrigin: hexOrigin,
            currentHex: { q: 0, r: 0, s: 0, x: 0, y: 0 },
            lastValidHex: { q: 0, r: 0, s: 0, x: 0, y: 0 },
            playerPosition: { ...playerHex, ...playerPixel },
            obstacles: WALLS,
            cameFrom: {},
            hexPathMap: [],
            path: [],
            isRightMouseDown: false,
            canvasSize: { canvasWidth: 800, canvasHeight: 600 },
            isAnimating: false,
            animationPath: [],
            animationIndex: 0,
            animationPosition: null,
            animationTrail: [],
            clickEffect: null,
            clickEffectTime: 0
        };
    }

    componentDidMount() {
        // Wait for refs to be available
        requestAnimationFrame(() => {
            // Calculate hex parameters
            const hexParameters = this.getHexParametres();
            this.setState({ hexParameters }, () => {
                // Make sure refs are available before proceeding
                if (this.canvasHex.current && 
                    this.canvasView.current && 
                    this.canvasInteraction.current && 
                    this.canvasCoordinates.current) {
                    this.initializeCanvases();
                    this.setupEventListeners();
                    this.drawInitialState();
                } else {
                    console.error("Canvas references not available");
                }
            });
        });
    }

    componentWillUnmount() {
        this.removeEventListeners();
        window.removeEventListener('resize', this.handleResize);

        // Clear any ongoing animation
        if (this.animationFrameId) {
            clearTimeout(this.animationFrameId);
        }
    }

    // Setup methods
    initializeCanvases = () => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;

        // Initialize all canvases with proper dimensions - REMOVE canvasPath
        const canvases = [
            this.canvasHex.current,
            this.canvasInteraction.current,
            this.canvasView.current,
            this.canvasCoordinates.current
        ];

        canvases.forEach(canvas => {
            if (canvas) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            }
        });

        this.getCanvasPosition(this.canvasInteraction.current);
    }

    setupEventListeners = () => {
        window.addEventListener("mouseup", this.handleMouseUp);

        // Set up a one-time mouse move listener to trigger path visualization
        const initialMouseMoveHandler = (e) => {
            this.handleMouseMove(e);
            window.removeEventListener("mousemove", initialMouseMoveHandler);
        };
        window.addEventListener("mousemove", initialMouseMoveHandler);
    }

    removeEventListeners = () => {
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    drawInitialState = () => {
        // Draw the base hexes first
        this.drawHexes();

        // We need to wait for hexPathMap to be populated
        setTimeout(() => {
            // Run BFS with initial player position
            const cameFrom = breadthFirstSearch(
                this.state.playerPosition, 
                this.state.hexPathMap, 
                this.obstaclesRef.current
            );
            this.setState({ cameFrom });

            // Draw obstacles
            this.drawObstacles();

            // Draw player position
            this.drawPlayerPosition();
        }, 100);
    }

    // Update handling
    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentHex !== this.state.currentHex) {
            this.updateForCurrentHexChange();
        }

        if (prevState.cameFrom !== this.state.cameFrom) {
            this.updateForCameFromChange();
        }
    }

    updateForCurrentHexChange = () => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasInteraction.current.getContext("2d");

        // Clear the interaction canvas completely
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw in the correct order: obstacles first, then path, then player
        this.drawObstacles();
        this.drawPath();
        this.drawPlayerPosition();
    }

    updateForCameFromChange = () => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasView.current.getContext("2d");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Visualize BFS results
        for (let l in this.state.cameFrom) {
            const { q, r, s } = JSON.parse(l);
            const { x, y } = hexToPixel(
                Hex(q, r, s), 
                this.state.hexSize, 
                this.state.hexOrigin
            );
            drawHex(
                ctx, 
                Point(x, y), 
                this.state.hexSize, 
                "black", 
                "SkyBlue", 
                0.1
            );
        }

        this.drawPlayerPosition();
    }

    // Hex grid calculations
    getHexParametres = () => {
        let hexHeight = this.state.hexSize * 2;
        let hexWidth = (Math.sqrt(3) / 2) * hexHeight;
        let vertDist = (hexHeight * 3) / 4;
        let horizDist = hexWidth;
        return { hexWidth, hexHeight, vertDist, horizDist };
    }

    getCanvasPosition = (canvasID) => {
        if (!canvasID) return;
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

    // Drawing methods
    drawHexes = () => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasHex.current.getContext("2d");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Set consistent line properties
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";

        const { hexWidth, hexHeight, vertDist, horizDist } = this.state.hexParameters;
        const hexOrigin = this.state.hexOrigin;
        let qLeftSide = Math.round(hexOrigin.x / horizDist);
        let qRightSide = Math.round((canvasWidth - hexOrigin.x) / horizDist);
        let rTopSide = Math.round(hexOrigin.y / vertDist);
        let rBottomSide = Math.round((canvasHeight - hexOrigin.y) / vertDist);
        var hexPathMap = [];
        var p = 0;

        // Draw hexes in the bottom half
        for (let r = 0; r <= rBottomSide; r++) {
            if (r % 2 === 0 && r !== 0) {
                p++;
            }
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                const hex = Hex(q - p, r, -(q - p) - r);
                const { x, y } = hexToPixel(hex, this.state.hexSize, this.state.hexOrigin);
                if (
                    x > hexWidth / 2 &&
                    x < canvasWidth - hexWidth / 2 &&
                    y > hexHeight / 2 &&
                    y < canvasHeight - hexHeight / 2
                ) {
                    drawHex(ctx, Point(x, y), this.state.hexSize, "black", "SkyBlue");
                    hexPathMap.push(JSON.stringify(hex));
                }
            }
        }

        // Draw hexes in the top half
        var n = 0;
        for (let r = -1; r >= -rTopSide; r--) {
            if (r % 2 !== 0) {
                n++;
            }
            for (let q = -qLeftSide; q <= qRightSide; q++) {
                const hex = Hex(q + n, r, -(q + n) - r);
                const { x, y } = hexToPixel(hex, this.state.hexSize, this.state.hexOrigin);
                if (
                    x > hexWidth / 2 &&
                    x < canvasWidth - hexWidth / 2 &&
                    y > hexHeight / 2 &&
                    y < canvasHeight - hexHeight / 2
                ) {
                    drawHex(ctx, Point(x, y), this.state.hexSize, "black", "SkyBlue");
                    hexPathMap.push(JSON.stringify(hex));
                }
            }
        }

        this.setState({ hexPathMap });
    }

    drawObstacles = () => {
        this.obstaclesRef.current.forEach(hexStr => {
            const { q, r, s } = JSON.parse(hexStr);
            const { x, y } = hexToPixel(Hex(q, r, s), this.state.hexSize, this.state.hexOrigin);
            drawHex(
                this.canvasInteraction.current.getContext("2d"), 
                Point(x, y), 
                this.state.hexSize, 
                "black", 
                "grey"
            );
        });
    }

    drawPlayerPosition = () => {
        const { x, y } = hexToPixel(
            this.state.playerPosition, 
            this.state.hexSize, 
            this.state.hexOrigin
        );
        drawHex(
            this.canvasInteraction.current.getContext("2d"),
            Point(x, y),
            this.state.hexSize,
            "black", // Border color
            "green", // Fill color
            1.0      // Full opacity
        );
    }

    drawPath = () => {
        let path = this.state.path;
        if (!path || path.length === 0) return;

        // Draw the path on the interaction canvas, not a dedicated path canvas
        for (let i = 0; i < path.length; i++) {
            const { q, r } = JSON.parse(path[i]);
            const { x, y } = hexToPixel(
                Hex(q, r, -q - r), 
                this.state.hexSize, 
                this.state.hexOrigin
            );
            drawHex(
                this.canvasInteraction.current.getContext("2d"),
                Point(x, y),
                this.state.hexSize,
                "black",
                "yellow",
                0.3
            );
        }
    }

    // Event handlers
    handleMouseMove = (e) => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const { hexSize, hexOrigin } = this.state;

        // Ensure hexParameters is available
        if (!this.state.hexParameters) {
            console.error("hexParameters not available");
            return;
        }

        const { hexWidth, hexHeight } = this.state.hexParameters;

        // Get mouse position relative to canvas
        const canvasInteraction = this.canvasInteraction.current;
        if (!canvasInteraction) return;

        let rect = canvasInteraction.getBoundingClientRect();
        let offsetX = e.pageX - rect.left;
        let offsetY = e.pageY - (window.pageYOffset + rect.top);

        // Convert to hex coordinates
        const { q, r, s } = cubeRound(
            pixelToHex(Point(offsetX, offsetY), hexSize, hexOrigin)
        );

        const { x, y } = hexToPixel(
            Hex(q, r, s), 
            hexSize, 
            hexOrigin
        );

        // Check if the current hex is a wall
        const hexStr = JSON.stringify(Hex(q, r, s));
        const isWall = this.obstaclesRef.current.has(hexStr);

        // Update current hex if within bounds
        if (
            x > hexWidth / 2 &&
            x < canvasWidth - hexWidth / 2 &&
            y > hexHeight / 2 &&
            y < canvasHeight - hexHeight / 2
        ) {
            this.setState({
                currentHex: { q, r, s, x, y }
            });

            // Only update lastValidHex and path if not on a wall
            if (!isWall) {
                // Calculate path from the CURRENT player position (which might be animating)
                // or from the actual player position if not animating
                const startPosition = this.state.isAnimating ? 
                    this.state.animationPosition : this.state.playerPosition;

                const path = getPath(
                    startPosition,
                    Hex(q, r, s),
                    this.state.cameFrom
                );

                this.setState({
                    lastValidHex: { q, r, s, x, y },
                    path
                });

                // If we're animating, redraw with animation, otherwise redraw normally
                if (this.state.isAnimating) {
                    this.redrawWithAnimation();
                } else {
                    this.redrawEverything();
                }
            }
        }

        // Handle wall creation/deletion with right mouse drag
        if (this.state.isRightMouseDown) {
            // Add throttling to prevent too frequent updates
            const now = Date.now();
            if (this.lastWallUpdateTime && now - this.lastWallUpdateTime < 50) return;
            this.lastWallUpdateTime = now;

            if (hexStr === this.lastRightDragHex) return;
            this.lastRightDragHex = hexStr;

            // Create a temporary variable to hold our current obstacles
            const obstacles = new Set(this.obstaclesRef.current);

            if (!obstacles.has(hexStr)) {
                // Add wall
                obstacles.add(hexStr);
                drawHex(
                    this.canvasInteraction.current.getContext("2d"), 
                    Point(x, y), 
                    this.state.hexSize, 
                    "black", 
                    "grey"
                );
            } else {
                // Remove wall
                obstacles.delete(hexStr);
                drawHex(
                    this.canvasInteraction.current.getContext("2d"), 
                    Point(x, y), 
                    this.state.hexSize, 
                    "black", 
                    "SkyBlue"
                );
            }

            // Update the obstaclesRef
            this.obstaclesRef.current = obstacles;

            // Run BFS with updated obstacles
            const cameFrom = breadthFirstSearch(
                this.state.playerPosition, 
                this.state.hexPathMap, 
                obstacles
            );

            // Update state with new BFS results
            this.setState({
                obstacles: Array.from(obstacles),
                cameFrom
            }, () => {
                // If we're on a wall, use lastValidHex for path calculation
                if (isWall && this.state.lastValidHex) {
                    const newPath = getPath(
                        this.state.playerPosition,
                        Hex(this.state.lastValidHex.q, this.state.lastValidHex.r, this.state.lastValidHex.s),
                        cameFrom
                    );

                    // Only update the path, not the current hex
                    this.setState({ path: newPath }, () => {
                        // Redraw with the correct order
                        const ctx = this.canvasInteraction.current.getContext("2d");
                        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                        this.drawObstacles();
                        this.drawPath();
                        this.drawPlayerPosition();
                    });
                }
            });
        }
    }

    handleClick = () => {
        // Don't allow new clicks during animation
        if (this.state.isAnimating) return;

        const { currentHex } = this.state;
        const { q, r, s } = currentHex;
        const hexStr = JSON.stringify(Hex(q, r, s));

        // Don't allow moving to obstacles
        if (this.obstaclesRef.current.has(hexStr)) {
            return;
        }

        // Get the path to the clicked position
        const path = getPath(
            this.state.playerPosition,
            Hex(q, r, s),
            this.state.cameFrom
        );

        if (!path || path.length === 0) return;

        // Add click effect at target location
        const { x, y } = hexToPixel(
            Hex(q, r, s), 
            this.state.hexSize, 
            this.state.hexOrigin
        );

        this.setState({
            clickEffect: {
                x, y,
                size: this.state.hexSize
            },
            clickEffectTime: Date.now()
        }, () => {
            requestAnimationFrame(this.drawClickEffect);
        });

        // Start the animation
        this.startPathAnimation(path);
    }

    handleRightClick = (e) => {
        e.preventDefault();
        this.setState({ isRightMouseDown: true });
        this.lastWallUpdateTime = Date.now(); // Initialize the throttling timestamp

        const canvasInteraction = this.canvasInteraction.current;
        if (!canvasInteraction) return;

        const rect = canvasInteraction.getBoundingClientRect();
        const offsetX = e.pageX - rect.left;
        const offsetY = e.pageY - (window.pageYOffset + rect.top);
        const hex = cubeRound(
            pixelToHex(Point(offsetX, offsetY), this.state.hexSize, this.state.hexOrigin)
        );
        const hexStr = JSON.stringify(hex);

        // Store the current path to restore it after wall operation
        const currentPath = [...this.state.path];

        // Create a temporary variable to hold our current obstacles
        const obstacles = new Set(this.obstaclesRef.current);

        // Toggle obstacle state
        if (obstacles.has(hexStr)) {
            obstacles.delete(hexStr);
        } else {
            obstacles.add(hexStr);
        }

        // Update the obstaclesRef
        this.obstaclesRef.current = obstacles;

        // Update state and redraw
        this.setState(
            { obstacles: Array.from(obstacles) },
            () => {
                // Redraw the grid
                clearCanvas(
                    this.canvasHex.current,
                    this.state.canvasSize.canvasWidth,
                    this.state.canvasSize.canvasHeight
                );
                this.drawHexes();

                const cameFrom = breadthFirstSearch(
                    this.state.playerPosition,
                    this.state.hexPathMap,
                    obstacles
                );

                this.setState({ cameFrom }, () => {
                    // If the hex we right-clicked on is now a wall, use lastValidHex for path
                    if (obstacles.has(hexStr)) {
                        const { lastValidHex, playerPosition } = this.state;
                        if (lastValidHex) {
                            const newPath = getPath(
                                Hex(playerPosition.q, playerPosition.r, playerPosition.s),
                                Hex(lastValidHex.q, lastValidHex.r, lastValidHex.s),
                                cameFrom
                            );
                            this.setState({ path: newPath });
                        } else {
                            this.setState({ path: currentPath }); // Restore original path
                        }
                    } else {
                        // If we removed a wall, update the lastValidHex to current position
                        this.setState({ 
                            lastValidHex: hex,
                            path: getPath(
                                Hex(this.state.playerPosition.q, this.state.playerPosition.r, this.state.playerPosition.s),
                                hex,
                                cameFrom
                            )
                        });
                    }

                    // Draw in the correct order
                    this.drawObstacles();
                    this.drawPath();
                    this.drawPlayerPosition();
                });
            }
        );
    }

    handleMouseUp = (e) => {
        if (e.button === 2) {
            this.setState({
                obstacles: Array.from(this.obstaclesRef.current),
                isRightMouseDown: false
            }, () => {
                // When mouse up, redraw everything in the correct order
                const { canvasWidth, canvasHeight } = this.state.canvasSize;
                const ctx = this.canvasInteraction.current.getContext("2d");
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                this.drawObstacles();
                this.drawPath();
                this.drawPlayerPosition();
            });

            this.lastRightDragHex = null;
            this.lastWallUpdateTime = 0;
        }
    }

    startPathAnimation = (path) => {
        if (!path || path.length === 0) return;

        // Convert the path of strings to actual coordinates
        const animationPath = path.map(p => {
            const { q, r, s } = JSON.parse(p);
            const { x, y } = hexToPixel(
                Hex(q, r, s), 
                this.state.hexSize, 
                this.state.hexOrigin
            );
            return { q, r, s, x, y };
        });

        // Store the target position (where the user clicked)
        const targetPosition = animationPath[animationPath.length - 1];

        // Set initial animation state
        // Note: We're clearing the path here to remove red hexes during animation
        this.setState({
            isAnimating: true,
            animationPath,
            animationIndex: 0,
            animationPosition: { ...this.state.playerPosition },
            targetPosition, // Store this for later use
            path: [], // Clear the path
            animationTrail: [] // Initialize empty trail
        }, () => {
            // Start the animation loop
            this.animateAlongPath();
        });
    }

    animateAlongPath = () => {
        const { animationIndex, animationPath } = this.state;

        if (animationIndex >= animationPath.length - 1) {
            // Animation complete - update player position to target
            const finalPosition = animationPath[animationPath.length - 1];

            this.setState({
                isAnimating: false,
                playerPosition: finalPosition,
                animationPosition: null,
                animationTrail: [] // Clear the trail
            }, () => {
                // Recalculate BFS with new player position
                const cameFrom = breadthFirstSearch(
                    this.state.playerPosition,
                    this.state.hexPathMap,
                    this.obstaclesRef.current
                );
                this.setState({ cameFrom });

                // Final redraw
                this.redrawEverything();
            });

            return;
        }

        // Keep a trail of recent positions (max 3)
        const trailLength = 3; 
        const newTrail = [...this.state.animationTrail];

        if (animationIndex > 0) {
            newTrail.push(animationPath[animationIndex]);
            if (newTrail.length > trailLength) {
                newTrail.shift();
            }
        }

        // Move to next position in path
        this.setState({
            animationIndex: animationIndex + 1,
            animationPosition: animationPath[animationIndex + 1],
            animationTrail: newTrail
        }, () => {
            // Redraw with animation position
            this.redrawWithAnimation();

            // Schedule next frame
            // 
            this.animationFrameId = setTimeout(
                this.animateAlongPath, 
                this.animationSpeed
            );
        });
    }

    redrawWithAnimation = () => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        const ctx = this.canvasInteraction.current.getContext("2d");

        // Clear the interaction canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw obstacles
        this.drawObstacles();

        // Draw the animation path from start to current position with lower opacity
        const { animationPath, animationIndex } = this.state;
        for (let i = 0; i <= animationIndex; i++) {
            const { x, y } = animationPath[i];
            drawHex(
                ctx,
                Point(x, y),
                this.state.hexSize,
                "black",
                "green",
                0.3 // Lower opacity for path
            );
        }

        // Draw the trail with fading opacity
        this.state.animationTrail.forEach((position, index) => {
            const opacity = 0.3 * ((index + 1) / this.state.animationTrail.length);
            drawHex(
                ctx,
                Point(position.x, position.y),
                this.state.hexSize * 0.8, // Slightly smaller
                "black",
                "green",
                opacity
            );
        });

        // Draw the path to mouse if we have one
        if (this.state.path && this.state.path.length > 0) {
            for (let i = 0; i < this.state.path.length; i++) {
                const { q, r } = JSON.parse(this.state.path[i]);
                const { x, y } = hexToPixel(
                    Hex(q, r, -q - r), 
                    this.state.hexSize, 
                    this.state.hexOrigin
                );
                drawHex(
                    ctx,
                    Point(x, y),
                    this.state.hexSize,
                    "black",
                    "blue", // Use a different color for the path to mouse
                    0.5    // Medium opacity
                );
            }
        }

        // Draw animation position (player)
        const { x, y } = this.state.animationPosition;
        this.drawPulsingHex(
            ctx,
            Point(x, y),
            this.state.hexSize,
            "black",
            "green"
        );
        this.drawClickEffect();
    }

    redrawEverything = () => {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;

        // Clear canvases
        const ctxInteraction = this.canvasInteraction.current.getContext("2d");
        ctxInteraction.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw in correct order
        this.drawObstacles();
        this.drawPath();
        this.drawPlayerPosition();
    }

    drawPulsingHex = (ctx, center, size, lineColor, fillColor) => {
        // Calculate pulse effect (0.9 to 1.1 scale)
        const pulseScale = 1 + 0.1 * Math.sin(Date.now() / 100);
        const pulseSize = size * pulseScale;

        // Draw the hex with the pulsing size
        drawHex(
            ctx,
            center,
            pulseSize,
            lineColor,
            fillColor,
            1.0
        );
    }

    drawClickEffect = () => {
        const { clickEffect, clickEffectTime } = this.state;
        if (!clickEffect) return;

        const ctx = this.canvasInteraction.current.getContext("2d");
        const elapsed = Date.now() - clickEffectTime;
        const duration = 250; // Effect duration in ms

        if (elapsed > duration) {
            this.setState({ clickEffect: null });
            return;
        }

        // Calculate effect size and opacity
        const progress = elapsed / duration;
        const size = clickEffect.size * (1 + progress);
        const opacity = 1 - progress;

        // Draw expanding hex
        drawHex(
            ctx,
            Point(clickEffect.x, clickEffect.y),
            size,
            `rgba(255, 200, 0, ${opacity})`,
            `rgba(255, 255, 0, ${opacity * 0.3})`,
            opacity
        );

        // Request next frame
        requestAnimationFrame(this.drawClickEffect);
    }

    // Utility functions
    clearWalls = () => {
        // Reset obstacles to only include the original walls
        this.obstaclesRef.current = new Set(this.originalWalls);

        // Update state
        this.setState(
            { obstacles: Array.from(this.originalWalls) },
            () => {
                // Redraw everything
                const { canvasWidth, canvasHeight } = this.state.canvasSize;
                clearCanvas(this.canvasInteraction.current, canvasWidth, canvasHeight);

                this.drawHexes();
                this.drawObstacles();

                const cameFrom = breadthFirstSearch(
                    this.state.playerPosition,
                    this.state.hexPathMap,
                    this.obstaclesRef.current
                );
                this.setState({ cameFrom }, () => {
                    // Draw path if needed
                    if (this.state.path.length > 0) {
                        this.drawPath();
                    }

                    // Draw player last so it's on top
                    this.drawPlayerPosition();
                });
            }
        );
    }

    render() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;

        return (
            <div className="BFSExtra">
            <div className="canvasWrapper">
            <Canvas 
            id="hexCanvas"
            className="display"
            forwardedRef={this.canvasHex}
            width={canvasWidth}
            height={canvasHeight}
            />
            <Canvas 
            id="coordCanvas"
            className="display"
            forwardedRef={this.canvasCoordinates}
            width={canvasWidth}
            height={canvasHeight}
            />
            <Canvas 
            id="viewCanvas"
            className="display"
            forwardedRef={this.canvasView}
            width={canvasWidth}
            height={canvasHeight}
            />
            {/* REMOVE pathCanvas */}
            <Canvas 
            id="interactionCanvas"
            className="interactive"
            forwardedRef={this.canvasInteraction}
            width={canvasWidth}
            height={canvasHeight}
            onMouseMove={this.handleMouseMove}
            onClick={this.handleClick}
            onContextMenu={this.handleRightClick}
            />
            </div>
            <Controls onClearWalls={this.clearWalls} />
            </div>
        );
    }
}
