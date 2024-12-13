import React from 'react';
import { Container } from '@pixi/react';
import { calculateRelativePosition, getPart } from '../utils';

const Custom = ({scale, part, parent: {parts, panelDimensions: [panelWidth, panelHeight]}, onClick}) => {
    const {components} = part;
    const [fixedX, fixedY] = calculateRelativePosition(part, parts, panelWidth, panelHeight);
    return (
        <Container 
            x={fixedX * scale}
            y={fixedY * scale}
        >
            {components.map((component, index) => (getPart(component, scale, {panelDimensions: [0, 0]}, index, () => {onClick(part)})))}
        </Container>
    );
}

export default Custom;