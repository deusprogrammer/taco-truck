import React from 'react'
import '@pixi/events'
import { calculateRelativePosition, calculateSizeOfPart } from '../utils'
import PartSvg from './PartSvg'

const CustomPartSvg = ({ part, units, drillingGuide, parent, scale }) => {
    const [width, height] = calculateSizeOfPart(part)
    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    const [fixedX, fixedY] = calculateRelativePosition(
        { ...part, dimensions: [width, height] },
        parts,
        panelWidth,
        panelHeight
    )

    if (units) {
        scale = 1
    }

    return (
        <>
            <g
                transform={`translate(${fixedX * scale} ${fixedY * scale}${units ?? ''}) rotate(${part.rotation || 0} 0 0)`}
            >
                {part.layout.parts.map((customPart, index) => (
                    <>
                        <PartSvg
                            key={`custom-partsvg-${customPart.id || index}`}
                            scale={scale}
                            units={units}
                            drillingGuide={drillingGuide}
                            part={customPart}
                            parent={{
                                ...part.layout,
                                panelDimensions: [width, height],
                            }}
                        />
                    </>
                ))}
            </g>
        </>
    )
}

export default CustomPartSvg
