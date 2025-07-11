import { Container, Graphics } from '@pixi/react'
import { convertPathToInstructions } from '../svg-utils'

const getColor = (node) => {
    const { graphical, hovered } = node

    if (hovered) {
        return 0x00ff00
    } else if (graphical) {
        return 0xffffff
    } else {
        return 0x000000
    }
}

const getOpacity = (node) => {
    const { graphical } = node

    if (graphical) {
        return 0.25
    } else {
        return 1
    }
}

const drawPath = (g, d, node) => {
    g.clear()
    const color = getColor(node)
    const opacity = getOpacity(node)
    g.lineStyle(2, color, opacity)
    let subpathStart = null

    const instructions = convertPathToInstructions(
        d.replace(/(?<![eE])-/g, ' -')
    )

    instructions?.forEach(
        ({
            type,
            points,
            point,
            rx,
            ry,
            xAxisRotation,
            largeArcFlag,
            sweepFlag,
        }) => {
            if (type === 'move') {
                g.moveTo(point[0], point[1])
                subpathStart = [point[0], point[1]]
            } else if (type === 'line') {
                g.lineTo(point[0], point[1])
            } else if (type === 'quadratic') {
                if (!points || points.length !== 2) return
                g.moveTo(points[0][0], points[0][1])
                g.quadraticCurveTo(
                    points[1][0],
                    points[1][1],
                    points[2][0],
                    points[2][1]
                )
            } else if (type === 'bezier') {
                if (!points || points.length !== 3) return
                g.bezierCurveTo(
                    points[0][0],
                    points[0][1],
                    points[1][0],
                    points[1][1],
                    points[2][0],
                    points[2][1]
                )
            } else if (type === 'arc') {
                // Unimplemented
            } else if (type === 'close') {
                if (subpathStart) {
                    g.lineTo(subpathStart[0], subpathStart[1])
                }
            }
        }
    )
    // g.endFill()
}

const drawEllipticalRoundedRect = (g, x, y, width, height, rx, ry, node) => {
    g.clear()
    const color = getColor(node)
    const opacity = getOpacity(node)
    g.lineStyle(2, color, opacity)
    g.beginFill(0x000000)

    // Ensure rx and ry are numbers and do not exceed half width/height
    const _rx = Math.min(Number(rx) || 0, width / 2)
    const _ry = Math.min(Number(ry) || 0, height / 2)

    if (!_rx && !_ry) {
        g.drawRect(x, y, width, height)
        return
    }

    // Start at top-left corner, after the horizontal radius
    g.moveTo(x + _rx, y)

    // Top edge
    g.lineTo(x + width - _rx, y)

    // Top-right corner (elliptical arc)
    g.arc(x + width - _rx, y + _ry, _rx, Math.PI * 1.5, 0, false)

    // Right edge
    g.lineTo(x + width, y + height - _ry)

    // Bottom-right corner (elliptical arc)
    g.arc(x + width - _rx, y + height - _ry, _rx, 0, Math.PI * 0.5, false)

    // Bottom edge
    g.lineTo(x + _rx, y + height)

    // Bottom-left corner (elliptical arc)
    g.arc(x + _rx, y + height - _ry, _rx, Math.PI * 0.5, Math.PI, false)

    // Left edge
    g.lineTo(x, y + _ry)

    // Top-left corner (elliptical arc)
    g.arc(x + _rx, y + _ry, _rx, Math.PI, Math.PI * 1.5, false)
    g.endFill()
}

const renderModelTree = (modelTree, path = 'root') => {
    if (!modelTree) return null

    let graphicsToDraw = []

    const {
        type,
        d,
        children,
        transform,
        r,
        cx,
        cy,
        x,
        y,
        rx,
        ry,
        width,
        height,
    } = modelTree

    if (type === 'path') {
        graphicsToDraw.push(
            <Graphics
                key={`${path}-path`}
                draw={(g) => drawPath(g, d, modelTree)}
            />
        )
    } else if (type === 'circle') {
        graphicsToDraw.push(
            <Graphics
                key={`${path}-circle`}
                draw={(g) => {
                    g.clear()
                    const color = getColor(modelTree)
                    const opacity = getOpacity(modelTree)
                    g.lineStyle(2, color, opacity)
                    g.beginFill(0x000000)
                    g.drawCircle(cx, cy, r)
                    g.endFill()
                }}
            />
        )
    } else if (type === 'rectangle') {
        graphicsToDraw.push(
            <Graphics
                key={`${path}-rectangle`}
                draw={(g) => {
                    drawEllipticalRoundedRect(
                        g,
                        x,
                        y,
                        width,
                        height,
                        rx,
                        ry,
                        modelTree
                    )
                }}
            />
        )
    } else if (type === 'polyline') {
        graphicsToDraw.push(
            <Graphics
                key={`${path}-polyline`}
                draw={(g) => {
                    g.clear()
                    const color = getColor(modelTree)
                    const opacity = getOpacity(modelTree)
                    g.lineStyle(2, color, opacity)
                    const pts = modelTree.points
                    if (pts && pts.length > 0) {
                        g.moveTo(pts[0][0], pts[0][1])
                        for (let i = 1; i < pts.length; i++) {
                            g.lineTo(pts[i][0], pts[i][1])
                        }
                    }
                }}
            />
        )
    } else if (type === 'polygon') {
        graphicsToDraw.push(
            <Graphics
                key={`${path}-polygon`}
                draw={(g) => {
                    g.clear()
                    const color = getColor(modelTree)
                    g.lineStyle(2, color, 1)
                    const pts = modelTree.points
                    if (pts && pts.length > 0) {
                        g.moveTo(pts[0][0], pts[0][1])
                        for (let i = 1; i < pts.length; i++) {
                            g.lineTo(pts[i][0], pts[i][1])
                        }
                        g.lineTo(pts[0][0], pts[0][1]) // Close the shape
                    }
                }}
            />
        )
    }

    if (children) {
        children.forEach((child, idx) => {
            graphicsToDraw = [
                ...graphicsToDraw,
                renderModelTree(child, `${path}.${idx}`),
            ]
        })
    }

    return (
        <Container
            x={transform?.translate?.x || 0}
            y={transform?.translate?.y || 0}
            scale={{ x: transform?.scale?.x || 1, y: transform?.scale?.y || 1 }}
        >
            {graphicsToDraw}
        </Container>
    )
}

const ComplexPart = ({ modelTree, scale }) => {
    return (
        <Container
            // x={modelTree?.header?.viewBox?.x}
            // y={modelTree?.header?.viewBox?.y}
            scale={scale}
        >
            {renderModelTree(modelTree)}
        </Container>
    )
}

export default ComplexPart
