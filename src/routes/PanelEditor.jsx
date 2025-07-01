import { Graphics, Stage } from '@pixi/react'
import { useDrag } from '@use-gesture/react'
import { useAtom } from 'jotai'
import React, { useRef, useState } from 'react'
import { screenSizeAtom } from '../atoms/ViewOptions.atom'
import GeometryMenu from '../components/menus/GeometryMenu'

const getYCoordinate = (x, x1, y1, x2, y2) => {
    // Calculate the slope (m) of the line
    const m = (y2 - y1) / (x2 - x1)

    // Calculate the y-intercept (b) of the line
    const b = y1 - m * x1

    // Calculate the y coordinate using the line equation y = mx + b
    const y = m * x + b

    return y
}

const calculateQuadraticBezierPoint = (t, p0, p1, p2) => {
    const p0p1 = [p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1])]
    const p1p2 = [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]

    return [
        p0p1[0] + t * (p1p2[0] - p0p1[0]),
        p0p1[1] + t * (p1p2[1] - p0p1[1]),
    ]
}

const drawQuadraticBezierCurve = (g, p0, p1, p2) => {
    g.clear()
    g.lineStyle(2, 0xffffff, 1)
    g.moveTo(p0[0], p0[1])
    const steps = 100
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const point = calculateQuadraticBezierPoint(t, p0, p1, p2)
        g.lineTo(point[0], point[1])
    }
    g.lineTo(p2[0], p2[1])
}

const QuadraticBezierCurve = ({ p0, p1, p2 }) => {
    const drawCurve = (g) => {
        drawQuadraticBezierCurve(g, p0, p1, p2)
    }
    return <Graphics draw={drawCurve} />
}

const Point = ({ x, y, selected, onClick, onHover }) => {
    const [hovered, setHovered] = useState(false)

    const drawPoint = (x, y, g) => {
        g.clear()
        g.beginFill(hovered || selected ? 0xff0000 : 0xffffff)
        g.drawCircle(x, y, 5)
        g.endFill()
    }

    return (
        <Graphics
            draw={(g) => drawPoint(x, y, g)}
            interactive={true}
            onpointerdown={onClick}
            onpointerover={() => {
                setHovered(true)
                onHover(true)
            }}
            onpointerout={() => {
                setHovered(false)
                onHover(false)
            }}
        />
    )
}

const Line = ({ x1, y1, x2, y2, selected, onHover, onClick }) => {
    const [hovered, setHovered] = useState(false)

    const drawLineAsRectangle = (g) => {
        g.clear()
        g.lineStyle(0) // No border
        g.beginFill(hovered || selected ? 0xff0000 : 0xffffff, 1)

        const width = 2 // Width of the rectangle (line thickness)
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        const angle = Math.atan2(y2 - y1, x2 - x1)

        g.drawRect(0, -width / 2, length, width)
        g.endFill()

        g.position.set(x1, y1)
        g.rotation = angle
    }

    return (
        <Graphics
            draw={drawLineAsRectangle}
            interactive={true}
            onpointerdown={onClick}
            onpointerover={() => {
                setHovered(true)
                onHover(true)
            }}
            onpointerout={() => {
                setHovered(false)
                onHover(false)
            }}
        />
    )
}

const PanelEditor = () => {
    const [scale, setScale] = useState(1.0)
    const [lines, setLines] = useState([])
    const [points, setPoints] = useState([])
    const [startPoint, setStartPoint] = useState(null)
    const [endPoint, setEndPoint] = useState(null)
    const [selectedLineIndex, setSelectedLineIndex] = useState(null)
    const [hoveredLine, setHoveredLine] = useState(null)
    const [hoveredPoint, setHoveredPoint] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState(null)
    const [movingPoint, setMovingPoint] = useState(null)
    const [[screenWidth, screenHeight]] = useAtom(screenSizeAtom)

    const startPointIndex = useRef(null)
    const endPointIndex = useRef(null)

    const bind = useDrag(
        ({ xy, dragging, shiftKey }) => {
            if (shiftKey || movingPoint) {
                if (dragging && selectedPoint !== null) {
                    const pointsCopy = [...points]
                    pointsCopy[selectedPoint] = xy
                    setMovingPoint(selectedPoint)
                    setPoints(pointsCopy)
                } else if (!dragging) {
                    setSelectedPoint(null)
                    setMovingPoint(null)
                }
                return
            }

            if (!dragging) {
                const pointsCopy = [...points]
                let start = startPointIndex.current
                let end = endPointIndex.current

                console.log(`${start} -> ${end}`)

                if (start === null) {
                    start = pointsCopy.length
                    pointsCopy.push(startPoint)
                }
                if (end === null) {
                    end = pointsCopy.length
                    pointsCopy.push(endPoint)
                }

                setPoints(pointsCopy)
                setLines([...lines, [start, end]])
                setStartPoint(null)
                setEndPoint(null)
                setSelectedPoint(null)
                setSelectedLineIndex(lines.length)
                startPointIndex.current = null
                endPointIndex.current = null
                return
            }

            if (!startPoint) {
                if (hoveredPoint !== null) {
                    setStartPoint(points[hoveredPoint])
                    startPointIndex.current = hoveredPoint
                } else if (hoveredLine) {
                    setStartPoint([
                        xy[0],
                        getYCoordinate(
                            xy[0],
                            points[hoveredLine[0]][0],
                            points[hoveredLine[0]][1],
                            points[hoveredLine[1]][0],
                            points[hoveredLine[1]][1]
                        ),
                    ])
                } else {
                    setStartPoint(xy)
                }
                setEndPoint(xy)
            } else {
                if (hoveredPoint !== null) {
                    setEndPoint(points[hoveredPoint])
                    endPointIndex.current = hoveredPoint
                } else if (hoveredLine) {
                    setEndPoint([
                        xy[0],
                        getYCoordinate(
                            xy[0],
                            points[hoveredLine[0]][0],
                            points[hoveredLine[0]][1],
                            points[hoveredLine[1]][0],
                            points[hoveredLine[1]][1]
                        ),
                    ])
                } else {
                    setEndPoint(xy)
                    endPointIndex.current = null
                }
            }
        },
        {
            drag: {
                pointer: {
                    touch: true,
                    mouse: true,
                },
            },
        }
    )

    const selectedLine = lines?.[selectedLineIndex]

    return (
        <div>
            <div className="absolute left-0 top-0 flex w-screen flex-row justify-center">
                <div className="flex flex-row">
                    <button
                        className="w-12 bg-white text-black"
                        onClick={() =>
                            setScale((old) => {
                                if (old - 0.05 <= 0) {
                                    return old
                                }
                                return old - 0.05
                            })
                        }
                    >
                        -
                    </button>
                    <div>{Math.trunc(scale * 100)}%</div>
                    <button
                        className="w-12 bg-white text-black"
                        onClick={() =>
                            setScale((old) => {
                                return old + 0.05
                            })
                        }
                    >
                        +
                    </button>
                </div>
            </div>
            {points && selectedLine ? (
                <GeometryMenu
                    selectedGeometry={{
                        x1: points[selectedLine[0]][0],
                        y1: points[selectedLine[0]][1],
                        x2: points[selectedLine[1]][0],
                        y2: points[selectedLine[1]][1],
                    }}
                    onUpdate={({ x1, y1, x2, y2 }) => {
                        const startPointIndex = lines[selectedLineIndex][0]
                        const endPointIndex = lines[selectedLineIndex][1]
                        const pointsCopy = [...points]
                        pointsCopy[startPointIndex] = [x1, y1]
                        pointsCopy[endPointIndex] = [x2, y2]
                        setPoints(pointsCopy)
                    }}
                />
            ) : null}
            <div {...bind()}>
                <Stage
                    width={screenWidth}
                    height={screenHeight}
                    options={{ background: 0x1099bb }}
                >
                    {startPoint && endPoint ? (
                        <>
                            <Line
                                x1={startPoint[0]}
                                x2={endPoint[0]}
                                y1={startPoint[1]}
                                y2={endPoint[1]}
                                onClick={() => {}}
                                onHover={() => {}}
                            />
                            <Point
                                x={startPoint[0]}
                                y={startPoint[1]}
                                onClick={() => {}}
                                onHover={() => {}}
                            />
                            <Point
                                x={endPoint[0]}
                                y={endPoint[1]}
                                onClick={() => {}}
                                onHover={() => {}}
                            />
                        </>
                    ) : null}
                    {lines.map((segment, index) => {
                        return (
                            <Line
                                key={`segment-${index}`}
                                x1={points[segment[0]][0] * scale}
                                x2={points[segment[1]][0] * scale}
                                y1={points[segment[0]][1] * scale}
                                y2={points[segment[1]][1] * scale}
                                selected={index === selectedLineIndex}
                                onClick={() => {
                                    setSelectedLineIndex(index)
                                }}
                                onHover={(isHovered) => {
                                    if (!isHovered) {
                                        setHoveredLine(null)
                                    } else {
                                        setHoveredLine(segment)
                                    }
                                }}
                            />
                        )
                    })}
                    {points.map((point, index) => {
                        return (
                            <Point
                                key={`point-${index}`}
                                x={point[0] * scale}
                                y={point[1] * scale}
                                onClick={() => {
                                    setSelectedPoint(index)
                                }}
                                onHover={(isHovered) => {
                                    if (!isHovered) {
                                        setHoveredPoint(null)
                                    } else {
                                        setHoveredPoint(index)
                                    }
                                }}
                            />
                        )
                    })}
                </Stage>
            </div>
        </div>
    )
}

export default PanelEditor
