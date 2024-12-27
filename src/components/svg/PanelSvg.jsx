import React from 'react'

const PanelSvg = ({ layout, fill }) => {
    const clipPathId = `panelClip-${layout?.panelDimensions?.[0]}-${layout?.panelDimensions?.[1]}`
    return (
        <>
            <defs>
                <clipPath id={clipPathId}>
                    <rect
                        x={0}
                        y={0}
                        rx={layout?.cornerRadius || 0}
                        ry={layout?.cornerRadius || 0}
                        width={layout?.panelDimensions?.[0]}
                        height={layout?.panelDimensions?.[1]}
                    />
                </clipPath>
            </defs>
            <rect
                x={0}
                y={0}
                rx={layout?.cornerRadius || 0}
                ry={layout?.cornerRadius || 0}
                width={layout?.panelDimensions?.[0]}
                height={layout?.panelDimensions?.[1]}
                stroke="white"
                strokeWidth={1}
                fill="black"
            />
            <g clipPath={`url(#${clipPathId})`}>
                {layout.artwork && (
                    <image
                        href={layout.artwork}
                        transform={`translate(${layout.artworkOffset?.[0] || 0}, ${layout.artworkOffset?.[1] || 0}) scale(${layout.artworkZoom || 1})`}
                    />
                )}
            </g>
        </>
    )
}

export default PanelSvg
