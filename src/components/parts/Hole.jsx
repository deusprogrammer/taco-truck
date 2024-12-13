import React from 'react';
import { Graphics } from '@pixi/react';
import { calculateRelativePosition } from '../utils';
import { partTable } from '../../data/parts.table';

const Hole = ({scale, part, parent: {parts, panelDimensions: [panelWidth, panelHeight]}, onClick}) => {
    const {partId, type} = part;
    const [fixedX, fixedY] = calculateRelativePosition(part, parts, panelWidth, panelHeight);

    const drawCircle = (x, y, radius, renderScale, g) => {
        g.beginFill(0x000000);
        g.drawCircle(renderScale * x, renderScale * y, renderScale * radius);
        g.endFill();
    }

    return (
        <Graphics draw={(g) => {drawCircle(fixedX, fixedY, partTable[type][partId]/2, scale, g)}} onclick={() => onClick(part)} />
    );
}

export default Hole;