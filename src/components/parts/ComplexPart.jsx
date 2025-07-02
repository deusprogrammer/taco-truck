import { Container, Graphics } from '@pixi/react'

function collectInstructionTypes(node) {
    let types = []

    // If this node has an instructions array, collect their types
    if (node.instructions && Array.isArray(node.instructions)) {
        types.push(...node.instructions.map((instr) => instr.type))
    }

    // If this node has children, recurse into them
    if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
            types.push(...collectInstructionTypes(child))
        }
    }

    return types
}

const drawPath = (g, instructions, hovered) => {
    g.clear()
    g.lineStyle(2, 0xffffff, 1)
    // g.beginFill(0x000000)
    let subpathStart = null

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
                const color = hovered ? 0x00ff00 : 0x000000
                g.lineStyle(2, color, 1)
                g.lineTo(point[0], point[1])
            } else if (type === 'quadratic') {
                if (!points || points.length !== 2) return
                g.moveTo(points[0][0], points[0][1])
                const color = hovered ? 0x00ff00 : 0x000000
                g.lineStyle(2, color, 1)
                g.quadraticCurveTo(
                    points[1][0],
                    points[1][1],
                    points[2][0],
                    points[2][1]
                )
            } else if (type === 'bezier') {
                if (!points || points.length !== 3) return
                const color = hovered ? 0x00ff00 : 0x000000
                g.lineStyle(2, color, 1)
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
                    const color = hovered ? 0x00ff00 : 0x000000
                    g.lineStyle(2, color, 1)
                    g.lineTo(subpathStart[0], subpathStart[1])
                }
            }
        }
    )
    // g.endFill()
}

const drawEllipticalRoundedRect = (g, x, y, width, height, rx, ry, hovered) => {
    g.clear()
    const color = hovered ? 0x00ff00 : 0x000000
    g.lineStyle(2, color, 1)
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

const renderModelTree = (modelTree) => {
    if (!modelTree) {
        return null
    }

    let graphicsToDraw = []

    const {
        type,
        instructions,
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
        hovered,
    } = modelTree

    if (type === 'path') {
        graphicsToDraw.push(
            <Graphics draw={(g) => drawPath(g, instructions, hovered)} />
        )
    } else if (type === 'circle') {
        graphicsToDraw.push(
            <Graphics
                draw={(g) => {
                    g.clear()
                    const color = hovered ? 0x00ff00 : 0x000000
                    g.lineStyle(2, color, 1)
                    g.beginFill(0x000000)
                    g.drawCircle(cx, cy, r)
                    g.endFill()
                }}
            />
        )
    } else if (type === 'rectangle') {
        graphicsToDraw.push(
            <Graphics
                draw={(g) => {
                    drawEllipticalRoundedRect(
                        g,
                        x,
                        y,
                        width,
                        height,
                        rx,
                        ry,
                        hovered
                    )
                }}
            />
        )
    } else if (type === 'polyline') {
        graphicsToDraw.push(
            <Graphics
                draw={(g) => {
                    g.clear()
                    const color = hovered ? 0x00ff00 : 0x000000
                    g.lineStyle(2, color, 1)
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
                draw={(g) => {
                    g.clear()
                    const color = hovered ? 0x00ff00 : 0x000000
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
        children.forEach((child) => {
            graphicsToDraw = [...graphicsToDraw, renderModelTree(child)]
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
    return <Container scale={scale}>{renderModelTree(modelTree)}</Container>
}

export default ComplexPart
