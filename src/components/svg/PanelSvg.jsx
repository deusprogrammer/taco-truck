import React from 'react'

const PanelSvg = ({ layout, fill }) => (
    <>
        <defs>
            <clipPath id="panelClip">
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
            stroke="black"
            strokeWidth={1}
            fill="black"
        />
        {layout.artwork && (
            <image
                href={layout.artwork}
                width={layout?.panelDimensions?.[0]}
                height={layout?.panelDimensions?.[1]}
                clipPath="url(#panelClip)"
            />
        )}
    </>
)

export default PanelSvg
