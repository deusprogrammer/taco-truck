import React from 'react'

const PanelSvg = ({ layout, units, scale }) => {
    const clipPathId = `panelClip-${layout?.panelDimensions?.[0]}-${layout?.panelDimensions?.[1]}`

    if (units) {
        scale = 1
    }

    return (
        <>
            <defs>
                <clipPath id={clipPathId}>
                    <rect
                        x={0}
                        y={0}
                        rx={layout?.cornerRadius * scale || 0}
                        ry={layout?.cornerRadius * scale || 0}
                        width={`${layout?.panelDimensions?.[0] * scale}${units ?? ''}`}
                        height={`${layout?.panelDimensions?.[1] * scale}${units ?? ''}`}
                    />
                </clipPath>
            </defs>
            <rect
                x={0}
                y={0}
                rx={layout?.cornerRadius * scale || 0}
                ry={layout?.cornerRadius * scale || 0}
                width={`${layout?.panelDimensions?.[0] * scale}${units ?? ''}`}
                height={`${layout?.panelDimensions?.[1] * scale}${units ?? ''}`}
                stroke="white"
                strokeWidth={1}
                fill="black"
            />
            <g clipPath={`url(#${clipPathId})`}>
                {layout.artwork && (
                    <image
                        href={layout.artwork}
                        transform={`translate(${layout.artworkOffset?.[0] * scale || 0}${units ?? ''}, ${layout.artworkOffset?.[1] * scale || 0}${units ?? ''}) scale(${layout.artworkZoom * scale || 1})`}
                    />
                )}
            </g>
        </>
    )
}

export default PanelSvg
