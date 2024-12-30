import React, { useCallback } from 'react'
import { Graphics, Text } from '@pixi/react'
import CustomPart from './CustomPart'
import { TextStyle } from 'pixi.js'
import '@pixi/events'
import {
    calculateRelativePosition,
    calculateTextPositionAndRotation,
} from '../utils'
import { CIRCLE, SQUARE, partTable } from '../../data/parts.table'
import { useAtom } from 'jotai'
import {
    buttonOpacityAtom,
    renderMeasurementsAtom,
} from '../../atoms/ViewOptions.atom'
import { useButtonStatus } from '../LayoutDisplay'

const Part = ({
    scale,
    part,
    selectedPartId,
    hoveredPartId,
    parent,
    onClick,
    onClickPart,
}) => {
    const [showMeasurements] = useAtom(renderMeasurementsAtom)
    const [buttonOpacity] = useAtom(buttonOpacityAtom)
    const buttonPressed = useButtonStatus(part)
    const { partId, type, id, rotation } = part

    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    const [fixedX, fixedY] = calculateRelativePosition(
        part,
        parts,
        panelWidth,
        panelHeight
    )

    const drawCircle = useCallback(
        (x, y, radius, rim, renderScale, g) => {
            g.clear()
            if (
                (selectedPartId === id || hoveredPartId === id) &&
                (selectedPartId || hoveredPartId)
            ) {
                g.beginFill(selectedPartId === id ? 0x00ff00 : 0xff0000)
            } else {
                g.beginFill(0xffffff)
            }

            if (rim > 0) {
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * (radius + rim)
                )
                g.beginFill(buttonPressed ? 0x00ff00 : 0x000000)
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * radius
                )
                g.endFill()
            } else {
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * radius
                )
                g.beginFill(buttonPressed ? 0x00ff00 : 0x000000)
                g.drawCircle(
                    renderScale * x,
                    renderScale * y,
                    renderScale * radius - 2
                )
                g.endFill()
            }
        },
        [id, selectedPartId, hoveredPartId, buttonPressed]
    )

    const drawRectangle = useCallback(
        (x, y, size, rim, renderScale, g) => {
            x = x - size[0] / 2
            y = y - size[1] / 2
            g.clear()
            if (
                (selectedPartId === id || hoveredPartId === id) &&
                (selectedPartId || hoveredPartId)
            ) {
                g.beginFill(selectedPartId === id ? 0x00ff00 : 0x00ffff)
                g.drawRect(
                    renderScale * (x - rim - 2),
                    renderScale * (y - rim - 2),
                    renderScale * (size[0] + rim * 2 + 4),
                    renderScale * (size[1] + rim * 2 + 4)
                )
            }
            g.beginFill(0xffffff)
            g.drawRect(
                renderScale * (x - rim),
                renderScale * (y - rim),
                renderScale * (size[0] + 2 * rim),
                renderScale * (size[1] + 2 * rim)
            )
            g.beginFill(buttonPressed ? 0x00ff00 : 0x000000)
            g.drawRect(
                renderScale * x,
                renderScale * y,
                renderScale * size[0],
                renderScale * size[1]
            )
            g.beginFill(0xff0000)
        },
        [id, selectedPartId, hoveredPartId, buttonPressed]
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

                g.lineStyle(1, '#FF0000')
                g.moveTo(renderScale * x, renderScale * y)
                g.lineTo(renderScale * x2, renderScale * y)
                g.lineStyle(1, '#00FF00')
                g.lineTo(renderScale * x2, renderScale * y2)
            }
        },
        [part, parts, panelHeight, panelWidth]
    )

    if (type === 'custom') {
        return (
            <CustomPart
                scale={scale}
                part={part}
                selectedPartId={selectedPartId}
                hoveredPartId={hoveredPartId}
                parent={parent}
                onClick={onClick}
                onClickPart={onClickPart}
            />
        )
    }

    if (!partTable[type]?.[partId]) {
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
        } = calculateTextPositionAndRotation(xMin, yMin, xMax, yMin, 10)
        const {
            x: text2X,
            y: text2Y,
            rotation: text2Rotation,
        } = calculateTextPositionAndRotation(xMin, yMin, xMin, yMax, 10)
        if (xMax - xMin !== 0) {
            textComponents.push(
                <Text
                    key="text1"
                    x={text1X * scale}
                    y={text1Y * scale}
                    anchor={{ x: 1, y: 0.5 }}
                    rotation={text1Rotation}
                    style={
                        new TextStyle({
                            fill: '#FF0000',
                            fontSize: 5 * scale,
                        })
                    }
                    text={`${xMax - xMin}mm`}
                />
            )
        }
        if (yMax - yMin !== 0) {
            textComponents.push(
                <Text
                    key="text2"
                    x={text2X * scale}
                    y={text2Y * scale}
                    anchor={{ x: 1, y: 0.5 }}
                    rotation={text2Rotation}
                    style={
                        new TextStyle({
                            fill: '#00FF00',
                            fontSize: 5 * scale,
                        })
                    }
                    text={`${Math.abs(y2 - fixedY)}mm`}
                />
            )
        }
    }

    let component
    switch (shape) {
        case SQUARE:
            component = (
                <Graphics
                    draw={(g) => {
                        drawRectangle(fixedX, fixedY, size, rim, scale, g)
                    }}
                    alpha={buttonOpacity}
                    angle={rotation || 0}
                    zIndex={0}
                    interactive={true}
                    onclick={() => {
                        onClick && onClick(part)
                    }}
                    onpointerdown={() => {
                        onClickPart && onClickPart(part, 'DOWN')
                    }}
                    onpointerup={() => {
                        onClickPart && onClickPart(part, 'UP')
                    }}
                />
            )
            break
        case CIRCLE:
        default:
            component = (
                <Graphics
                    draw={(g) => {
                        drawCircle(fixedX, fixedY, size / 2, rim, scale, g)
                    }}
                    alpha={buttonOpacity}
                    angle={rotation || 0}
                    zIndex={0}
                    interactive={true}
                    onclick={() => {
                        onClick && onClick(part)
                    }}
                    onpointerdown={() => {
                        onClickPart && onClickPart(part, 'DOWN')
                    }}
                    onpointerup={() => {
                        onClickPart && onClickPart(part, 'UP')
                    }}
                />
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
                        zIndex={5}
                    />
                    {textComponents}
                </>
            ) : null}
        </>
    )
}

export default Part
