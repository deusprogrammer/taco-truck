import React from 'react'
import { calculateRelativePosition } from '../utils'
import { CIRCLE, SQUARE, partTable } from '../../data/parts.table'
import CustomPartSvg from './CustomPartSvg'

const PartSvg = ({ part, parent, units, drillingGuide, scale }) => {
    const { partId, type, rotation } = part

    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    const [fixedX, fixedY] = calculateRelativePosition(
        part,
        parts,
        panelWidth,
        panelHeight
    )

    if (units) {
        scale = 1
    }

    if (type === 'custom') {
        return (
            <CustomPartSvg
                part={part}
                units={units}
                drillingGuide={drillingGuide}
                parent={parent}
                scale={scale}
            />
        )
    }

    if (!partTable[type]?.[partId]) {
        return <></>
    }

    const { shape, size } = partTable[type][partId]
    let component
    switch (shape) {
        case SQUARE:
            component = (
                <rect
                    x={`${(fixedX - size[0] / 2) * scale}${units ?? ''}`}
                    y={`${(fixedY - size[1] / 2) * scale}${units ?? ''}`}
                    width={`${size[0] * scale}${units ?? ''}`}
                    height={`${size[1] * scale}${units ?? ''}`}
                    rotate={rotation || 0}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                />
            )
            break
        case CIRCLE:
        default:
            component = (
                <>
                    <circle
                        cx={`${fixedX * scale}${units ?? ''}`}
                        cy={`${fixedY * scale}${units ?? ''}`}
                        r={`${(size / 2) * scale}${units ?? ''}`}
                        fill="white"
                        stroke="black"
                        strokeWidth={1}
                    />
                    <circle
                        cx={`${fixedX * scale}${units ?? ''}`}
                        cy={`${fixedY * scale}${units ?? ''}`}
                        r={`${1 * scale}${units ?? ''}`}
                        fill="white"
                        stroke="black"
                        strokeWidth={1}
                    />
                    {drillingGuide ? (
                        <>
                            <line
                                x1={`${fixedX * scale - (size / 2) * scale}${units ?? ''}`}
                                x2={`${fixedX * scale + (size / 2) * scale}${units ?? ''}`}
                                y1={`${fixedY * scale}${units ?? ''}`}
                                y2={`${fixedY * scale}${units ?? ''}`}
                                stroke="black"
                            />
                            <line
                                y1={`${fixedY * scale - (size / 2) * scale}${units ?? ''}`}
                                y2={`${fixedY * scale + (size / 2) * scale}${units ?? ''}`}
                                x1={`${fixedX * scale}${units ?? ''}`}
                                x2={`${fixedX * scale}${units ?? ''}`}
                                stroke="black"
                            />
                        </>
                    ) : null}
                </>
            )
            break
    }

    return <>{component}</>
}

export default PartSvg
