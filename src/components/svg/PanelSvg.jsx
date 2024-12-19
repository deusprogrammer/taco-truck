import React from 'react';

const PanelSvg = ({layout, scale, fill}) => (
    <rect x={0} y={0} width={layout?.panelDimensions?.[0] * scale} height={layout?.panelDimensions?.[1] * scale} stroke="black" fill={fill} />
);

export default PanelSvg;