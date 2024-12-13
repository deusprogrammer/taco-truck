import React, { useState } from 'react';
import { Stage } from '@pixi/react';
import { getPart } from './utils';

const Panel = ({layout, onLayoutChange} = {layout: {parts: []}, onLayoutChange: () => {}}) => {
    const [currentScale, setCurrentScale] = useState(3.0);
    const [width, height] = layout.panelDimensions;

    return (
        <Stage width={width * currentScale} height={height * currentScale} options={{ background: 0x1099bb }}>
            {layout.parts.map((part, index) => getPart(part, currentScale, layout, index, () => {}))}
        </Stage>
    )
}

export default Panel;