import React from 'react';
import '@pixi/events';
import { calculateRelativePosition } from '../utils';
import PartSvg from './PartSvg';

const CustomPartSvg = ({scale, part, parent}) => {
    const svgElement = document.querySelector('svg');
    const boundingRect = svgElement.getBoundingClientRect();

    const width = boundingRect.width;
    const height = boundingRect.height;

    const {parts, panelDimensions} = parent;
    const [panelWidth, panelHeight] = panelDimensions || [0, 0];
    const [fixedX, fixedY] = calculateRelativePosition({...part, dimensions: [width/scale, height/scale]}, parts, panelWidth, panelHeight);

    return (
        <>
            {part.layout.parts.map((customPart, index) => (
                <React.Fragment key={`part-${index}`}>
                    <PartSvg
                        scale={scale} 
                        part={customPart}
                        adjustments={{x: fixedX * scale, y: fixedY * scale, rotation: part.rotation || 0}}
                        parent={{...part.layout, panelDimensions: [width, height]}}
                    />
                </React.Fragment>
            ))}
        </>
    );
}

export default CustomPartSvg;