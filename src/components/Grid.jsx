import React, { useCallback } from 'react'
import { Graphics } from '@pixi/react'
import { useAtom } from 'jotai'
import { renderGridAtom } from '../atoms/ViewOptions.atom'

const Grid = ({ scale, screenWidth, screenHeight, workspacePosition }) => {
    const [renderGrid] = useAtom(renderGridAtom)

    const drawGrid = useCallback(
        (g) => {
            g.clear()

            if (!renderGrid) {
                return
            }

            // Calculate the grid spacing in screen pixels
            const minorGridSpacing = 1 * scale // 1-unit grid

            // Calculate the visible area in world coordinates
            const worldLeft = -workspacePosition[0] / scale
            const worldTop = -workspacePosition[1] / scale
            const worldRight = worldLeft + screenWidth / scale
            const worldBottom = worldTop + screenHeight / scale

            // Draw minor grid (1-unit) - adaptive visibility like current system
            if (minorGridSpacing >= 5 && minorGridSpacing <= 200) {
                const leftGridLine = Math.floor(worldLeft / 1) * 1
                const topGridLine = Math.floor(worldTop / 1) * 1
                const rightGridLine = Math.ceil(worldRight / 1) * 1
                const bottomGridLine = Math.ceil(worldBottom / 1) * 1

                // Minor grid - lighter and adaptive
                const baseAlpha = 0.15
                const minorAlpha = Math.min(
                    0.4,
                    Math.max(
                        baseAlpha,
                        (minorGridSpacing - 10) / 120 + baseAlpha
                    )
                )
                g.lineStyle(1, 0xdddddd, minorAlpha)

                // Draw minor vertical lines
                for (let x = leftGridLine; x <= rightGridLine; x += 1) {
                    // Skip lines that will be drawn as major grid
                    if (x % 10 !== 0) {
                        const screenX = x * scale
                        g.moveTo(screenX, worldTop * scale)
                        g.lineTo(screenX, worldBottom * scale)
                    }
                }

                // Draw minor horizontal lines
                for (let y = topGridLine; y <= bottomGridLine; y += 1) {
                    // Skip lines that will be drawn as major grid
                    if (y % 10 !== 0) {
                        const screenY = y * scale
                        g.moveTo(worldLeft * scale, screenY)
                        g.lineTo(worldRight * scale, screenY)
                    }
                }
            }

            // Draw major grid (10-unit) - always visible when grid is on
            const leftMajorGridLine = Math.floor(worldLeft / 10) * 10
            const topMajorGridLine = Math.floor(worldTop / 10) * 10
            const rightMajorGridLine = Math.ceil(worldRight / 10) * 10
            const bottomMajorGridLine = Math.ceil(worldBottom / 10) * 10

            // Major grid - darker and always visible
            const majorAlpha = 0.4
            g.lineStyle(1, 0xaaaaaa, majorAlpha)

            // Draw major vertical lines
            for (let x = leftMajorGridLine; x <= rightMajorGridLine; x += 10) {
                // Skip origin lines - they'll be drawn separately
                if (x !== 0) {
                    const screenX = x * scale
                    g.moveTo(screenX, worldTop * scale)
                    g.lineTo(screenX, worldBottom * scale)
                }
            }

            // Draw major horizontal lines
            for (let y = topMajorGridLine; y <= bottomMajorGridLine; y += 10) {
                // Skip origin lines - they'll be drawn separately
                if (y !== 0) {
                    const screenY = y * scale
                    g.moveTo(worldLeft * scale, screenY)
                    g.lineTo(worldRight * scale, screenY)
                }
            }

            // Draw origin lines most prominently
            if (leftMajorGridLine <= 0 && rightMajorGridLine >= 0) {
                g.lineStyle(1, 0x888888, 0.7)
                const originX = 0
                const screenX = originX * scale
                g.moveTo(screenX, worldTop * scale)
                g.lineTo(screenX, worldBottom * scale)
            }

            if (topMajorGridLine <= 0 && bottomMajorGridLine >= 0) {
                g.lineStyle(1, 0x888888, 0.7)
                const originY = 0
                const screenY = originY * scale
                g.moveTo(worldLeft * scale, screenY)
                g.lineTo(worldRight * scale, screenY)
            }
        },
        [renderGrid, scale, screenWidth, screenHeight, workspacePosition]
    )

    // Don't render anything if grid is disabled
    if (!renderGrid) {
        return null
    }

    return (
        <Graphics
            draw={drawGrid}
            zIndex={-1000} // Ensure grid renders behind everything
        />
    )
}

export default Grid
