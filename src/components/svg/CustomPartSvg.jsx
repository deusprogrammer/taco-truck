import React from 'react'
import '@pixi/events'
import { calculateRelativePosition, calculateSizeOfPart } from '../utils'
import PartSvg from './PartSvg'

const CustomPartSvg = ({ scale, part, parent }) => {
    const [width, height] = calculateSizeOfPart(part)
    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    const [fixedX, fixedY] = calculateRelativePosition(
        { ...part, dimensions: [width, height] },
        parts,
        panelWidth,
        panelHeight
    )

    return (
        <>
            <g
                transform={`translate(${fixedX}, ${fixedY}) rotate(${part.rotate || 0})`}
            >
                {part.layout.parts.map((customPart, index) => (
                    <>
                        <PartSvg
                            key={`part-${index}`}
                            scale={scale}
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
