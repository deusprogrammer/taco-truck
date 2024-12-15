import React from 'react';
import '@pixi/events';
import { calculateRelativePosition } from '../utils';
import { Container } from '@pixi/react';
import Part from './Part';

const CustomPart = ({scale, part, selectedPartId, hoveredPartId, parent, onClick}) => {
    const {parts, panelDimensions} = parent;
    const [panelWidth, panelHeight] = panelDimensions || [0, 0];
    const [fixedX, fixedY] = calculateRelativePosition(part, parts, panelWidth, panelHeight);

    return (
        <Container
            x={fixedX * scale}
            y={fixedY * scale}
            onclick={() => onClick(part)}
            interactive={true}
        >
            {part.layout.parts.map((customPart, index) => (
                <Part 
                    key={`part-${index}`}
                    selectedPartId={selectedPartId}
                    hoveredPartId={hoveredPartId}
                    scale={scale} 
                    part={customPart} 
                    index={index} 
                    parent={part.layout}
                    onClick={onClick}
                />
            ))}
        </Container>
    );
}

export default CustomPart;