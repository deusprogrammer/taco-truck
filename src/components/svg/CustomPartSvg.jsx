import React from 'react';
import '@pixi/events';
import { calculateRelativePosition } from '../utils';
import PartSvg from './PartSvg';

const CustomPartSvg = ({scale, part, parent}) => {
    const {parts, panelDimensions} = parent;
    const [panelWidth, panelHeight] = panelDimensions || [0, 0];
    const [fixedX, fixedY] = calculateRelativePosition({...part, dimensions: [parent.panelDimensions[0]/scale, parent.panelDimensions[1]/scale]}, parts, panelWidth, panelHeight);

    return (
        <>
            {part.layout.parts.map((customPart, index) => (
                <React.Fragment key={`part-${index}`}>
                    <PartSvg
                        scale={scale} 
                        part={customPart}
                        adjustments={{x: fixedX * scale, y: fixedY * scale, rotation: part.rotation || 0}}
                        parent={{...part.layout, panelDimensions: [parent.panelDimensions[0], parent.panelDimensions[1]]}}
                    />
                </React.Fragment>
            ))}
        </>
    );
}

export default CustomPartSvg;