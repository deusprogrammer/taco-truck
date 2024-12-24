import { Graphics } from '@pixi/react'
import React from 'react'

const Panel = ({ layout, scale, fill }) => (
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
)

export default Panel
