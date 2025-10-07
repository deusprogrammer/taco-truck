import React, { useCallback } from 'react'
import { Graphics, Text } from '@pixi/react'
import CustomPart from './CustomPart'
import { TextStyle } from 'pixi.js'
import '@pixi/events'
import {
    calculateRelativePosition,
    calculateTextPositionAndRotation,
    isRootPartWithDependents,
} from '../utils'
import { CIRCLE, SQUARE } from '../../data/parts.table'
import { useAtom } from 'jotai'
import {
    buttonOpacityAtom,
    mappingStyleAtom,
    modeAtom,
    renderAnchorsAtom,
    renderMeasurementsAtom,
} from '../../atoms/ViewOptions.atom'
import { useButtonStatus } from '../LayoutDisplay'
import { ART_ADJUST } from '../elements/Modes'
import { MAPPINGS } from '../elements/Constants'
import ComplexPart from './ComplexPart'
import { usePartTable } from '../../hooks/PartTableHooks'

const Part = ({
    scale,
    part,
    selectedPartId,
    hoveredPartId,
    parent,
    onHoverPart,
    onClick,
    onClickPart,
    isChildOfCustomPart = false,
}) => {
    const { partTable } = usePartTable()
    const [showMeasurements] = useAtom(renderMeasurementsAtom)
    const [showAnchors] = useAtom(renderAnchorsAtom)
    const [buttonOpacity] = useAtom(buttonOpacityAtom)
    const [mode] = useAtom(modeAtom)
    const [mappingStyle] = useAtom(mappingStyleAtom)
    const buttonPressed = useButtonStatus(part)
    const { partId, type, id, rotation } = part

    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]

    // Calculate part dimensions for anchor calculations
    let partWithDimensions = part
    if (!part.dimensions && partTable?.[type]?.[partId]) {
        const { size } = partTable[type][partId]
        // For basic parts, size is typically a single number (diameter/width)
        // Convert to [width, height] format
        const dimensions = Array.isArray(size) ? size : [size, size]
        partWithDimensions = { ...part, dimensions }
    }

    // Use absolutePosition if available, otherwise calculate it
    const [fixedX, fixedY] =
        part.absolutePosition ||
        calculateRelativePosition(
            partWithDimensions,
            parts,
            panelWidth,
            panelHeight
        )

    const drawCircle = useCallback(
        (x, y, radius, rim, renderScale, g) => {
            g.clear()
            const isRootWithDependents = isRootPartWithDependents(id, parts)

            // Determine the base color for this part
            let baseColor = 0xffffff // Default white
            let rimColor = 0xffffff // Default white rim

            if (
                (selectedPartId === id || hoveredPartId === id) &&
                (selectedPartId || hoveredPartId)
            ) {
                baseColor = selectedPartId === id ? 0x00ff00 : 0xff0000
                rimColor = 0xffffff
            } else if (isRootWithDependents) {
                baseColor = 0xffffff // Keep background white
                rimColor = 0x8b0000 // Dark red rim for root parts with dependents
            }

            if (rim > 0) {
                g.beginFill(0x000000, 0)
                g.lineStyle(1, rimColor) // Colored rim
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * (radius + rim)
                )
                g.beginFill(buttonPressed ? 0x00ff00 : baseColor)
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * radius
                )
                g.endFill()
            } else {
                g.beginFill(0x000000, 0)
                g.lineStyle(1, rimColor) // Colored rim
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * radius
                )
                g.beginFill(buttonPressed ? 0x00ff00 : baseColor)
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * radius - 2
                )
                g.endFill()
            }
        },
        [id, selectedPartId, hoveredPartId, buttonPressed, parts]
    )

    const drawRectangle = useCallback(
        (x, y, size, rim, renderScale, g) => {
            x = x - size[0] / 2
            y = y - size[1] / 2
            g.clear()
            const isRootWithDependents = isRootPartWithDependents(id, parts)

            // Determine the base color for this part
            let baseColor = 0xffffff // Default white
            let rimColor = 0xffffff // Default white rim

            if (
                (selectedPartId === id || hoveredPartId === id) &&
                (selectedPartId || hoveredPartId)
            ) {
                baseColor = selectedPartId === id ? 0x00ff00 : 0x00ffff
                rimColor = 0xffffff
            } else if (isRootWithDependents) {
                baseColor = 0xffffff // Keep background white
                rimColor = 0x8b0000 // Dark red rim for root parts with dependents
            }

            if (
                (selectedPartId === id || hoveredPartId === id) &&
                (selectedPartId || hoveredPartId)
            ) {
                g.beginFill(baseColor)
                g.drawRect(
                    renderScale * (x - rim - 2),
                    renderScale * (y - rim - 2),
                    renderScale * (size[0] + rim * 2 + 4),
                    renderScale * (size[1] + rim * 2 + 4)
                )
            } else if (isRootWithDependents) {
                g.beginFill(baseColor)
                g.drawRect(
                    renderScale * (x - rim - 2),
                    renderScale * (y - rim - 2),
                    renderScale * (size[0] + rim * 2 + 4),
                    renderScale * (size[1] + rim * 2 + 4)
                )
            }
            g.beginFill(0x000000, 0)
            g.lineStyle(1, rimColor) // Colored rim
            g.drawRect(
                renderScale * (x - rim),
                renderScale * (y - rim),
                renderScale * (size[0] + 2 * rim),
                renderScale * (size[1] + 2 * rim)
            )
            g.beginFill(buttonPressed ? 0x00ff00 : baseColor)
            g.drawRect(
                renderScale * x,
                renderScale * y,
                renderScale * size[0],
                renderScale * size[1]
            )
        },
        [id, selectedPartId, hoveredPartId, buttonPressed, parts]
    )

    const drawLine = useCallback(
        (x, y, renderScale, g) => {
            g.clear()

            // Draw a line to the element it's relative to
            if (part.relativeTo) {
                const relativePart = parts.find(
                    ({ id }) => part.relativeTo === id
                )

                if (!relativePart) {
                    return
                }

                const [x2, y2] = calculateRelativePosition(
                    relativePart,
                    parts,
                    panelWidth,
                    panelHeight
                )

                // Enhanced line styling with better visibility
                const lineWidth = Math.max(1, 2 / renderScale) // Thicker lines that scale properly

                // Draw horizontal measurement line with shadow for better visibility
                g.lineStyle(lineWidth + 1, 0x000000, 0.3) // Black shadow
                g.moveTo(renderScale * x, renderScale * y)
                g.lineTo(renderScale * x2, renderScale * y)

                g.lineStyle(lineWidth, 0xff6600, 1) // Orange instead of red for better contrast
                g.moveTo(renderScale * x, renderScale * y)
                g.lineTo(renderScale * x2, renderScale * y)

                // Draw vertical measurement line with shadow
                g.lineStyle(lineWidth + 1, 0x000000, 0.3) // Black shadow
                g.lineTo(renderScale * x2, renderScale * y2)

                g.lineStyle(lineWidth, 0x00cc00, 1) // Brighter green for better contrast
                g.moveTo(renderScale * x2, renderScale * y)
                g.lineTo(renderScale * x2, renderScale * y2)

                // Add small arrows/markers at endpoints for better visual clarity
                const arrowSize = Math.max(2, 4 / renderScale)

                // Arrow at start point
                g.beginFill(0xff6600)
                g.drawCircle(renderScale * x, renderScale * y, arrowSize)
                g.endFill()

                // Arrow at end point
                g.beginFill(0x00cc00)
                g.drawCircle(renderScale * x2, renderScale * y2, arrowSize)
                g.endFill()

                // Arrow at corner point
                g.beginFill(0xffffff)
                g.lineStyle(1, 0x000000)
                g.drawCircle(renderScale * x2, renderScale * y, arrowSize * 0.7)
                g.endFill()
            }
        },
        [part, parts, panelHeight, panelWidth]
    )

    const drawAnchorCross = useCallback(
        (centerX, centerY, partWidth, partHeight, anchor, renderScale, g) => {
            g.clear()

            if (!anchor || !Array.isArray(anchor)) {
                return // Only skip if anchor is null/undefined or not an array
            }

            // Calculate anchor position relative to center
            // For regular parts, the anchor is relative to the part's bounds
            const halfWidth = partWidth / 2
            const halfHeight = partHeight / 2

            // Convert anchor from [0,1] coordinates to actual position
            // [0,0] = top-left, [0.5,0.5] = center, [1,1] = bottom-right
            const anchorX = centerX - halfWidth + anchor[0] * partWidth
            const anchorY = centerY - halfHeight + anchor[1] * partHeight

            const crossSize = Math.max(3, 6 / renderScale) // Cross size that scales appropriately
            const lineWidth = Math.max(1, 2 / renderScale)

            // Draw red cross at anchor point
            g.lineStyle(lineWidth, 0xff0000, 1) // Red color

            // Horizontal line
            g.moveTo(renderScale * (anchorX - crossSize), renderScale * anchorY)
            g.lineTo(renderScale * (anchorX + crossSize), renderScale * anchorY)

            // Vertical line
            g.moveTo(renderScale * anchorX, renderScale * (anchorY - crossSize))
            g.lineTo(renderScale * anchorX, renderScale * (anchorY + crossSize))
        },
        []
    )

    if (type === 'custom') {
        return (
            <CustomPart
                scale={scale}
                part={part}
                selectedPartId={selectedPartId}
                hoveredPartId={hoveredPartId}
                parent={parent}
                onHoverPart={onHoverPart}
                onClick={onClick}
                onClickPart={onClickPart}
            />
        )
    } else if (type === 'user') {
        return (
            <ComplexPart
                scale={scale}
                part={part}
                selectedPartId={selectedPartId}
                hoveredPartId={hoveredPartId}
                parent={parent}
                onHoverPart={onHoverPart}
                onClick={onClick}
                onClickPart={onClickPart}
            />
        )
    }

    if (!partTable?.[type]?.[partId]) {
        return <></>
    }

    const { shape, size, rim } = partTable[type][partId]
    const relativePart = parts.find(({ id }) => part.relativeTo === id)
    const textComponents = []
    if (relativePart) {
        const [x2, y2] = calculateRelativePosition(
            relativePart,
            parts,
            panelWidth,
            panelHeight
        )
        const xMax = Math.max(fixedX, x2)
        const yMax = Math.max(fixedY, y2)
        const xMin = Math.min(fixedX, x2)
        const yMin = Math.min(fixedY, y2)
        const {
            x: text1X,
            y: text1Y,
            rotation: text1Rotation,
        } = calculateTextPositionAndRotation(xMin, yMin, xMax, yMin, 0)
        const {
            x: text2X,
            y: text2Y,
            rotation: text2Rotation,
        } = calculateTextPositionAndRotation(xMin, yMin, xMin, yMax, 0)
        if (xMax - xMin !== 0) {
            textComponents.push(
                <Text
                    key="text1"
                    x={text1X * scale}
                    y={text1Y * scale}
                    anchor={{ x: 0.5, y: 0.5 }}
                    rotation={text1Rotation}
                    zIndex={50}
                    style={
                        new TextStyle({
                            fill: '#FF6600',
                            fontSize: Math.max(8, (12 / scale) * scale), // Better scaling
                            fontWeight: 'bold',
                            stroke: '#000000',
                            strokeThickness: 2,
                            dropShadow: true,
                            dropShadowColor: '#000000',
                            dropShadowBlur: 2,
                            dropShadowAngle: Math.PI / 6,
                            dropShadowDistance: 1,
                        })
                    }
                    text={`${Math.round((xMax - xMin) * 10) / 10}mm`}
                />
            )
        }
        if (yMax - yMin !== 0) {
            textComponents.push(
                <Text
                    key="text2"
                    x={text2X * scale}
                    y={text2Y * scale}
                    anchor={{ x: 0.5, y: 0.5 }}
                    rotation={text2Rotation}
                    zIndex={50}
                    style={
                        new TextStyle({
                            fill: '#00CC00',
                            fontSize: Math.max(8, (12 / scale) * scale), // Better scaling
                            fontWeight: 'bold',
                            stroke: '#000000',
                            strokeThickness: 2,
                            dropShadow: true,
                            dropShadowColor: '#000000',
                            dropShadowBlur: 2,
                            dropShadowAngle: Math.PI / 6,
                            dropShadowDistance: 1,
                        })
                    }
                    text={`${Math.round(Math.abs(y2 - fixedY) * 10) / 10}mm`}
                />
            )
        }
    }

    let component
    switch (shape) {
        case SQUARE:
            component = (
                <>
                    <Graphics
                        draw={(g) => {
                            drawRectangle(fixedX, fixedY, size, rim, scale, g)
                        }}
                        alpha={buttonOpacity}
                        angle={rotation || 0}
                        zIndex={1}
                        interactive={mode !== ART_ADJUST}
                        onmouseover={() => onHoverPart && onHoverPart(part)}
                        onmouseout={() => onHoverPart && onHoverPart(null)}
                        onpointerdown={() => {
                            onClick && onClick(part)
                            onClickPart && onClickPart(part, 'DOWN')
                        }}
                        onpointerup={() => {
                            onClickPart && onClickPart(part, 'UP')
                        }}
                    />
                    <Text
                        text={MAPPINGS[mappingStyle][part.mapping]}
                        anchor={0.5}
                        x={fixedX * scale}
                        y={fixedY * scale}
                        style={
                            new TextStyle({
                                fontFamily:
                                    '"Lucida Console", Monaco, monospace',
                                fontSize: 20 * scale * 0.5, // Adjust font size as needed
                                fill: 'white',
                            })
                        }
                    />
                </>
            )
            break
        case CIRCLE:
        default:
            component = (
                <>
                    <Graphics
                        draw={(g) => {
                            drawCircle(fixedX, fixedY, size / 2, rim, scale, g)
                        }}
                        alpha={buttonOpacity}
                        angle={rotation || 0}
                        zIndex={1}
                        interactive={mode !== ART_ADJUST}
                        onmouseover={() => onHoverPart && onHoverPart(part)}
                        onmouseout={() => onHoverPart && onHoverPart(null)}
                        onpointerdown={() => {
                            onClick && onClick(part)
                            onClickPart && onClickPart(part, 'DOWN')
                        }}
                        onpointerup={() => {
                            onClickPart && onClickPart(part, 'UP')
                        }}
                    />
                    <Text
                        text={MAPPINGS[mappingStyle][part.mapping]}
                        anchor={0.5}
                        x={fixedX * scale}
                        y={fixedY * scale}
                        style={
                            new TextStyle({
                                fontFamily:
                                    '"Lucida Console", Monaco, monospace',
                                fontSize: 20 * scale * 0.5, // Adjust font size as needed
                                fill: 'white',
                            })
                        }
                    />
                </>
            )
            break
    }

    return (
        <>
            {component}
            {showMeasurements ? (
                <>
                    <Graphics
                        draw={(g) => drawLine(fixedX, fixedY, scale, g)}
                        zIndex={999}
                    />
                    {textComponents}
                </>
            ) : null}
            {showAnchors && part.anchor && !isChildOfCustomPart ? (
                <Graphics
                    draw={(g) =>
                        drawAnchorCross(
                            fixedX, // Part's center position
                            fixedY,
                            size, // Part width
                            size, // Part height (assuming square for regular parts)
                            part.anchor,
                            scale,
                            g
                        )
                    }
                    zIndex={1000} // Above measurement lines
                />
            ) : null}
        </>
    )
}

export default Part
