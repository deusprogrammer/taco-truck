import React, { createRef } from 'react'
import '@pixi/events'
import { calculateRelativePosition, calculateSizeOfPart } from '../utils'
import { Container, Graphics } from '@pixi/react'
import Part from './Part'
import { useAtom } from 'jotai'
import { modeAtom, renderAnchorsAtom } from '../../atoms/ViewOptions.atom'
import { ART_ADJUST } from '../elements/Modes'
import { usePartTable } from '../../hooks/PartTableHooks'

const CustomPart = ({
    scale,
    part,
    selectedPartId,
    hoveredPartId,
    parent,
    onHoverPart,
    onClick,
    onClickPart,
}) => {
    const { partTable } = usePartTable()
    const containerRef = createRef()
    const [mode] = useAtom(modeAtom)
    const [showAnchors] = useAtom(renderAnchorsAtom)
    const [width, height] = calculateSizeOfPart(part, partTable)

    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    // Use absolutePosition if available, otherwise calculate it
    const [fixedX, fixedY] =
        part.absolutePosition ||
        calculateRelativePosition(
            { ...part, dimensions: [width, height] },
            parts,
            panelWidth,
            panelHeight
        )

    const flipOffsetX = part.flipX ? width * scale : 0
    const flipOffsetY = part.flipY ? height * scale : 0

    return (
        <>
            <Container
                ref={containerRef}
                x={fixedX * scale + flipOffsetX}
                y={fixedY * scale + flipOffsetY}
                scale={[1 * (part.flipX ? -1 : 1), 1 * (part.flipY ? -1 : 1)]}
                angle={part.rotation || 0}
                onclick={() => onClick && onClick(part)}
                onmouseover={() => onHoverPart && onHoverPart(part)}
                onmouseout={() => onHoverPart && onHoverPart(null)}
                onpointerdown={() => {
                    onClick && onClick(part)
                    onClickPart && onClickPart(part, 'DOWN')
                }}
                onpointerup={() => {
                    onClickPart && onClickPart(part, 'UP')
                }}
                interactive={mode !== ART_ADJUST}
            >
                <Graphics
                    alpha={0}
                    onclick={() => onClick && onClick(part)}
                    onmouseover={() => onHoverPart && onHoverPart(part)}
                    onmouseout={() => onHoverPart && onHoverPart(null)}
                    onpointerdown={() => {
                        onClick && onClick(part)
                        onClickPart && onClickPart(part, 'DOWN')
                    }}
                    onpointerup={() => {
                        onClick && onClick(null)
                        onClickPart && onClickPart(part, 'UP')
                    }}
                    interactive={mode !== ART_ADJUST}
                    draw={(g) => {
                        g.clear()
                        g.beginFill('green')
                        g.lineStyle({ width: 2, color: 'green' })
                        g.drawRoundedRect(
                            -10,
                            -10,
                            (width + 10) * scale,
                            (height + 10) * scale,
                            0
                        )
                        g.endFill()
                    }}
                />
                {selectedPartId === part.id || hoveredPartId === part.id ? (
                    <Graphics
                        draw={(g) => {
                            g.clear()
                            g.lineStyle({ width: 2, color: 'green' })
                            g.drawRoundedRect(
                                -10,
                                -10,
                                (width + 10) * scale,
                                (height + 10) * scale,
                                0
                            )
                            g.endFill()
                        }}
                    />
                ) : null}
                {showAnchors && part.anchor ? (
                    <Graphics
                        draw={(g) => {
                            g.clear()

                            // Calculate anchor position within the custom part bounds
                            const anchorX = part.anchor[0] * width
                            const anchorY = part.anchor[1] * height

                            const crossSize = Math.max(3, 6 / scale) // Cross size that scales appropriately
                            const lineWidth = Math.max(1, 2 / scale)

                            // Draw red cross at anchor point
                            g.lineStyle(lineWidth, 0xff0000, 1) // Red color

                            // Horizontal line
                            g.moveTo(
                                scale * (anchorX - crossSize),
                                scale * anchorY
                            )
                            g.lineTo(
                                scale * (anchorX + crossSize),
                                scale * anchorY
                            )

                            // Vertical line
                            g.moveTo(
                                scale * anchorX,
                                scale * (anchorY - crossSize)
                            )
                            g.lineTo(
                                scale * anchorX,
                                scale * (anchorY + crossSize)
                            )
                        }}
                        zIndex={1000} // Above other elements
                    />
                ) : null}
                {part.layout.parts.map((customPart, index) => (
                    <React.Fragment key={`custom-part-${index}`}>
                        <Part
                            selectedPartId={selectedPartId}
                            hoveredPartId={hoveredPartId}
                            scale={scale}
                            part={customPart}
                            index={index}
                            parent={{
                                ...part.layout,
                                panelDimensions: [width, height],
                            }}
                            onHoverPart={() => {}}
                            onClick={onClick}
                            onClickPart={onClickPart}
                            isChildOfCustomPart={true}
                        />
                    </React.Fragment>
                ))}
            </Container>
        </>
    )
}

export default CustomPart
