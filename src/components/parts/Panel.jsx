import { Graphics, Sprite } from '@pixi/react'
import React, { useRef } from 'react'

const Panel = ({ layout, scale, fill }) => {
    const maskRef = useRef(null)

    return (
        <>
            <Graphics
                draw={(g) => {
                    g.clear()
                    g.beginFill(fill)
                    g.drawRoundedRect(
                        0,
                        0,
                        layout?.panelDimensions?.[0] * scale,
                        layout?.panelDimensions?.[1] * scale,
                        layout?.cornerRadius * scale || 0
                    )
                    g.endFill()
                }}
            />
            {layout.artwork && (
                <>
                    <Graphics
                        draw={(g) => {
                            g.clear()
                            g.beginFill(fill)
                            g.drawRoundedRect(
                                0,
                                0,
                                layout?.panelDimensions?.[0] * scale,
                                layout?.panelDimensions?.[1] * scale,
                                layout?.cornerRadius * scale || 0
                            )
                            g.endFill()
                        }}
                        ref={maskRef}
                    />
                    <Sprite
                        image={layout.artwork}
                        x={layout.artworkOffset?.[0] * scale || 0}
                        y={layout.artworkOffset?.[1] * scale || 0}
                        anchor={0}
                        mask={maskRef.current}
                        scale={scale * (layout.artworkZoom || 1)}
                    />
                </>
            )}
            <Graphics
                draw={(g) => {
                    g.clear()
                    g.lineStyle({ width: 2, color: '#FFFFFF' })
                    g.drawRoundedRect(
                        0,
                        0,
                        layout?.panelDimensions?.[0] * scale,
                        layout?.panelDimensions?.[1] * scale,
                        layout?.cornerRadius * scale || 0
                    )
                }}
            />
        </>
    )
}

export default Panel
