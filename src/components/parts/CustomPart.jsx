import React, { createRef } from 'react';
import '@pixi/events';
import { calculateRelativePosition } from '../utils';
import { Container, Graphics } from '@pixi/react';
import Part from './Part';
import { usePixiContainerSize } from '../../hooks/MouseHooks';

const CustomPart = ({scale, part, selectedPartId, hoveredPartId, parent, onClick}) => {
    const containerRef = createRef();
    const [width, height] = usePixiContainerSize(containerRef);

    const {parts, panelDimensions} = parent;
    const [panelWidth, panelHeight] = panelDimensions || [0, 0];
    const [fixedX, fixedY, anchorX, anchorY] = calculateRelativePosition({...part, dimensions: [width/scale, height/scale]}, parts, panelWidth, panelHeight);

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
                <React.Fragment key={`part-${index}`}>
                    <Part 
                        selectedPartId={selectedPartId}
                        hoveredPartId={hoveredPartId}
                        scale={scale} 
                        part={customPart} 
                        index={index} 
                        parent={{...part.layout, panelDimensions: [width, height]}}
                        onClick={onClick}
                    />
                </React.Fragment>
            ))}
            <Graphics 
                draw={(g) => {
                    g.clear();
                    g.beginFill('#00ffff');
                    g.drawCircle(anchorX * scale, anchorY * scale, 2 * scale);
                    g.endFill();
                }}
            />
        </Container>
    );
}

export default CustomPart;