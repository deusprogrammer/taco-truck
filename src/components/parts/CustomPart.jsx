import React, { createRef } from 'react'
import '@pixi/events'
import { calculateRelativePosition, calculateSizeOfPart } from '../utils'
import { Container, Graphics } from '@pixi/react'
import Part from './Part'
import { useAtom } from 'jotai'
import { modeAtom } from '../../atoms/ViewOptions.atom'
import { ART_ADJUST } from '../elements/Modes'

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
    const containerRef = createRef()
    const [mode] = useAtom(modeAtom)
    const [width, height] = calculateSizeOfPart(part)

    const { parts, panelDimensions } = parent
    const [panelWidth, panelHeight] = panelDimensions || [0, 0]
    const [fixedX, fixedY] = calculateRelativePosition(
        { ...part, dimensions: [width, height] },
        parts,
        panelWidth,
        panelHeight
    )

    return (
        <>
            <Container
                ref={containerRef}
                x={fixedX * scale}
                y={fixedY * scale}
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
                        />
                    </React.Fragment>
                ))}
            </Container>
        </>
    )
}

export default CustomPart
