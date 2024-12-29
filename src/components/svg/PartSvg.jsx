import React from 'react'
import { calculateRelativePosition } from '../utils'
import { CIRCLE, SQUARE, partTable } from '../../data/parts.table'
import CustomPartSvg from './CustomPartSvg'

const PartSvg = ({ part, parent, scale }) => {
    const { partId, type, rotation } = part

    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    const [fixedX, fixedY] = calculateRelativePosition(
        part,
        parts,
        panelWidth,
        panelHeight
    )

    if (type === 'custom') {
        return <CustomPartSvg part={part} parent={parent} scale={scale} />
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
                    x={(fixedX - size[0] / 2) * scale}
                    y={(fixedY - size[1] / 2) * scale}
                    width={size[0] * scale}
                    height={size[1] * scale}
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
                        cx={fixedX * scale}
                        cy={fixedY * scale}
                        r={(size / 2) * scale}
                        fill="white"
                        stroke="black"
                        strokeWidth={1}
                    />
                    <circle
                        cx={fixedX * scale}
                        cy={fixedY * scale}
                        r={1 * scale}
                        fill="white"
                        stroke="black"
                        strokeWidth={1}
                    />
                </>
            )
            break
    }

    return <>{component}</>
}

export default PartSvg
