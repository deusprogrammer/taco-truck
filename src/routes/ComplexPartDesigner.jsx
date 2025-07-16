import { Container, Graphics, Stage } from '@pixi/react'
import { useDrag } from '@use-gesture/react'
import { useAtom } from 'jotai'
import React, { useRef, useState } from 'react'
import { screenSizeAtom } from '../atoms/ViewOptions.atom'
import GeometryMenu from '../components/menus/GeometryMenu'
import ComplexPartMenu, { PAN_TOOL } from '../components/menus/ComplexPartMenu'
import ComplexPart from '../components/parts/ComplexPart'
import { toast } from 'react-toastify'
import { convertPartModel } from '../components/utils'
import { createPart } from '../api/Api'

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

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
const screenCenter = [screenWidth / 2, screenHeight / 2]

const ComplexPartDesigner = () => {
    const [scale, setScale] = useState(1.0)
    const [part, setPart] = useState({
        name: '',
        modelTree: [],
        lines: [],
        points: [],
        curves: [],
        geometry: [],
    })
    const [startPoint, setStartPoint] = useState(null)
    const [endPoint, setEndPoint] = useState(null)
    const [selectedLineIndex, setSelectedLineIndex] = useState(null)
    const [hoveredLine, setHoveredLine] = useState(null)
    const [hoveredPoint, setHoveredPoint] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState(null)
    const [movingPoint, setMovingPoint] = useState(null)
    const [[screenWidth, screenHeight]] = useAtom(screenSizeAtom)

    const [selectedTool, setSelectedTool] = useState(PAN_TOOL)
    const [workspacePosition, setWorkspacePosition] = useState(screenCenter)

    const startPointIndex = useRef(null)
    const endPointIndex = useRef(null)

    const bind = useDrag(
        ({ xy, delta, dragging, shiftKey }) => {
            const adjustedXY = [
                xy[0] - workspacePosition[0],
                xy[1] - workspacePosition[1],
            ]

            if (selectedTool === PAN_TOOL) {
                if (dragging) {
                    setWorkspacePosition([
                        workspacePosition[0] + delta[0],
                        workspacePosition[1] + delta[1],
                    ])
                }
                return
            }

            if (shiftKey || movingPoint) {
                if (dragging && selectedPoint !== null) {
                    const pointsCopy = [...part.points]
                    pointsCopy[selectedPoint] = adjustedXY
                    setMovingPoint(selectedPoint)
                    setPart({ ...part, points: pointsCopy })
                } else if (!dragging) {
                    setSelectedPoint(null)
                    setMovingPoint(null)
                }
                return
            }

            if (!dragging) {
                const pointsCopy = [...part.points]
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

                setPart({
                    ...part,
                    points: pointsCopy,
                    lines: [...part.lines, [start, end]],
                })
                setStartPoint(null)
                setEndPoint(null)
                setSelectedPoint(null)
                setSelectedLineIndex(part.lines.length)
                startPointIndex.current = null
                endPointIndex.current = null
                return
            }

            if (!startPoint) {
                if (hoveredPoint !== null) {
                    setStartPoint(part.points[hoveredPoint])
                    startPointIndex.current = hoveredPoint
                } else if (hoveredLine) {
                    setStartPoint([
                        adjustedXY[0],
                        getYCoordinate(
                            adjustedXY[0],
                            part.points[hoveredLine[0]][0],
                            part.points[hoveredLine[0]][1],
                            part.points[hoveredLine[1]][0],
                            part.points[hoveredLine[1]][1]
                        ),
                    ])
                } else {
                    setStartPoint(adjustedXY)
                }
                setEndPoint(adjustedXY)
            } else {
                if (hoveredPoint !== null) {
                    setEndPoint(part.points[hoveredPoint])
                    endPointIndex.current = hoveredPoint
                } else if (hoveredLine) {
                    setEndPoint([
                        adjustedXY[0],
                        getYCoordinate(
                            adjustedXY[0],
                            part.points[hoveredLine[0]][0],
                            part.points[hoveredLine[0]][1],
                            part.points[hoveredLine[1]][0],
                            part.points[hoveredLine[1]][1]
                        ),
                    ])
                } else {
                    setEndPoint(adjustedXY)
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

    const selectedLine = part.lines?.[selectedLineIndex]

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
                    <div>
                        {workspacePosition[0]}, {workspacePosition[1]}
                    </div>
                </div>
            </div>
            {part.points && selectedLine ? (
                <GeometryMenu
                    selectedGeometry={{
                        x1: part.points[selectedLine[0]][0],
                        y1: part.points[selectedLine[0]][1],
                        x2: part.points[selectedLine[1]][0],
                        y2: part.points[selectedLine[1]][1],
                    }}
                    onUpdate={({ x1, y1, x2, y2 }) => {
                        const startPointIndex = part.lines[selectedLineIndex][0]
                        const endPointIndex = part.lines[selectedLineIndex][1]
                        const pointsCopy = [...part.points]
                        pointsCopy[startPointIndex] = [x1, y1]
                        pointsCopy[endPointIndex] = [x2, y2]
                        setPart({ ...part, points: pointsCopy })
                    }}
                />
            ) : null}
            <ComplexPartMenu
                part={part}
                selectedTool={selectedTool}
                onPartChange={setPart}
                onToolChange={setSelectedTool}
                onSave={async () => {
                    await createPart(part)
                    toast('Saved custom part!')
                }}
            />
            <div {...bind()}>
                <Stage
                    width={screenWidth}
                    height={screenHeight}
                    options={{ background: 0x1099bb }}
                >
                    <Container
                        x={workspacePosition[0] * scale}
                        y={workspacePosition[1] * scale}
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
                        {part.lines.map((segment, index) => {
                            return (
                                <Line
                                    key={`segment-${index}`}
                                    x1={part.points[segment[0]][0] * scale}
                                    x2={part.points[segment[1]][0] * scale}
                                    y1={part.points[segment[0]][1] * scale}
                                    y2={part.points[segment[1]][1] * scale}
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
                        {part.points.map((point, index) => {
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
                        <ComplexPart part={part} scale={scale} />
                    </Container>
                </Stage>
            </div>
        </div>
    )
}

export default ComplexPartDesigner
