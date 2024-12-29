import React from 'react'

const PanelSvg = ({ layout, fill, scale }) => {
    const clipPathId = `panelClip-${layout?.panelDimensions?.[0]}-${layout?.panelDimensions?.[1]}`
    return (
        <>
            <defs>
                <clipPath id={clipPathId}>
                    <rect
                        x={0}
                        y={0}
                        rx={layout?.cornerRadius * scale || 0}
                        ry={layout?.cornerRadius * scale || 0}
                        width={layout?.panelDimensions?.[0] * scale}
                        height={layout?.panelDimensions?.[1] * scale}
                    />
                </clipPath>
            </defs>
            <rect
                x={0}
                y={0}
                rx={layout?.cornerRadius * scale || 0}
                ry={layout?.cornerRadius * scale || 0}
                width={layout?.panelDimensions?.[0] * scale}
                height={layout?.panelDimensions?.[1] * scale}
                stroke="white"
                strokeWidth={1}
                fill="black"
            />
            <g clipPath={`url(#${clipPathId})`}>
                {layout.artwork && (
                    <image
                        href={layout.artwork}
                        transform={`translate(${layout.artworkOffset?.[0] * scale || 0}, ${layout.artworkOffset?.[1] * scale || 0}) scale(${layout.artworkZoom * scale || 1})`}
                    />
                )}
            </g>
        </>
    )
}

export default PanelSvg
