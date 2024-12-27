import { Graphics, Sprite } from '@pixi/react'
import React from 'react'

const Panel = ({ layout, scale, fill }) => (
    <>
        {layout.artwork && (
            <Sprite
                image={layout.artwork}
                width={layout?.panelDimensions?.[0] * scale}
                height={layout?.panelDimensions?.[1] * scale}
            />
        )}
        <Graphics
            draw={(g) => {
                g.clear()
                g.lineStyle({ width: 2, color: '#FFFFFF' })
                if (!layout.artwork) {
                    g.beginFill(fill)
                }
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
    </>
)

export default Panel
