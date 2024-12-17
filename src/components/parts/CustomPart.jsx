import React, { createRef } from 'react';
import '@pixi/events';
import { calculateRelativePosition } from '../utils';
import { Container, Graphics } from '@pixi/react';
import Part from './Part';

const CustomPart = ({scale, part, selectedPartId, hoveredPartId, parent, onClick}) => {
    const containerRef = createRef();
    const {parts, panelDimensions} = parent;
    const [panelWidth, panelHeight] = panelDimensions || [0, 0];
    const [fixedX, fixedY] = calculateRelativePosition(part, parts, panelWidth, panelHeight);

    return (
        <Container
            ref={containerRef}
            x={fixedX * scale}
            y={fixedY * scale}
            anchor={0.5}
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
                        parent={part.layout}
                        onClick={onClick}
                    />
                </React.Fragment>
            ))}
            <Graphics 
                draw={(g) => {
                    g.clear();
                    g.beginFill('#00ffff');
                    g.drawCircle(0, 0, 5);
                    g.endFill();
                }}
            />
            {/* <BoundingBox container={containerRef} enabled={true} /> */}
        </Container>
    );
}

export default CustomPart;