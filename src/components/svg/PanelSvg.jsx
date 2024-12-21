import React from 'react'

const PanelSvg = ({ layout, fill }) => (
    <rect
        x={0}
        y={0}
        width={layout?.panelDimensions?.[0]}
        height={layout?.panelDimensions?.[1]}
        stroke="black"
        strokeWidth={1}
        fill="white"
    />
)

export default PanelSvg
