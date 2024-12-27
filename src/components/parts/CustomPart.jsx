import React, { createRef } from 'react'
import '@pixi/events'
import { calculateRelativePosition, calculateSizeOfPart } from '../utils'
import { Container, Graphics } from '@pixi/react'
import Part from './Part'

const CustomPart = ({
    scale,
    part,
    selectedPartId,
    hoveredPartId,
    parent,
    onClick,
}) => {
    const containerRef = createRef()
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
        <Container
            ref={containerRef}
            x={fixedX * scale}
            y={fixedY * scale}
            angle={part.rotation || 0}
            onclick={() => onClick(part)}
            interactive={true}
        >
            {part.layout.parts.map((customPart, index) => (
                <React.Fragment key={`custom-part-${index}`}>
                    <Part
                        selectedPartId={selectedPartId}
                        hoveredPartId={hoveredPartId}
                        scale={scale}
                        part={customPart}
                        index={index}
                        parent={{
                            ...part.layout,
                            panelDimensions: [width, height],
                        }}
                        onClick={onClick}
                    />
                </React.Fragment>
            ))}
        </Container>
    )
}

export default CustomPart
