import { Graphics } from '@pixi/react'
import React, { useCallback, useEffect } from 'react'

const BoundingBox = ({ container, enabled }) => {
    useEffect(() => {
        container?.current.calculateBounds()
    }, [container])

    const drawBoundingBox = useCallback(
        (g) => {
            const bounds = container.current?.getLocalBounds()

            if (!bounds) {
                return
            }

            g.clear()
            g.lineStyle(2, 0xff0000)
            g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
        },
        [container]
    )

    if (!enabled) {
        return <></>
    }

    return <Graphics draw={drawBoundingBox} />
}

export default BoundingBox
