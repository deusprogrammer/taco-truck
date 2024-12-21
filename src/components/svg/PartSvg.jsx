import React from 'react';
import { calculateRelativePosition } from '../utils';
import { CIRCLE, SQUARE, partTable } from '../../data/parts.table';
import CustomPartSvg from './CustomPartSvg';

const PartSvg = ({scale, part, parent, adjustments}) => {
    const {partId, type, rotation} = part;

    const {parts, panelDimensions} = parent;
    const [panelWidth, panelHeight] = panelDimensions || [0, 0];
    const [fixedX, fixedY] = calculateRelativePosition(part, parts, panelWidth, panelHeight);

    if (type === "custom") {
        return (
            <CustomPartSvg
                scale={scale}
                part={part}
                parent={parent}
            />
        )
    }

    if (!partTable[type]?.[partId]) {
        return <></>;
    }

    const {shape, size} = partTable[type][partId];
    let component;
    switch (shape) {
        case SQUARE:
            component = (
                <rect 
                    x={fixedX * scale} 
                    y={fixedY * scale} 
                    width={size[0] * scale} 
                    height={size[1] * scale} 
                    rotate={rotation || 0} 
                    fill='white'
                    stroke="black" 
                    strokeWidth={1 * scale}
                />
            );
            break;
        case CIRCLE:
        default:
            component = (
                <>
                    <circle 
                        cx={fixedX * scale} 
                        cy={fixedY * scale} 
                        r={(size/2) * scale} 
                        fill='white'
                        stroke='black'
                        strokeWidth={1 * scale}
                    />
                    <circle 
                        cx={fixedX * scale} 
                        cy={fixedY * scale} 
                        r={1 * scale} 
                        fill='white'
                        stroke='black'
                        strokeWidth={1 * scale}
                    />
                </>
            );
            break;
    }

    return (
        <>
            {component}
        </>
    );
}

export default PartSvg;