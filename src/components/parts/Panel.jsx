import { Graphics } from '@pixi/react';
import React from 'react';

const Panel = ({layout, scale, fill}) => (
    <Graphics 
        draw={(g) => {
            g.clear();
            g.beginFill(fill);
            g.drawRect(0, 0, layout?.panelDimensions?.[0] * scale, layout?.panelDimensions?.[1] * scale);
            g.endFill();
        }}
        anchor={0.5}
    />
);

export default Panel;