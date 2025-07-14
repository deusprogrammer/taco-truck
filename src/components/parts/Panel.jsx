import { Graphics, Sprite } from '@pixi/react'
import { clearTextureCache } from '@pixi/utils'
import React, { useEffect, useRef } from 'react'
import { ART_ADJUST } from '../elements/Modes'
import { modeAtom } from '../../atoms/ViewOptions.atom'
import { useAtom } from 'jotai'
import ComplexPart from './ComplexPart'

const Panel = ({ layout, scale, fill, onClick }) => {
    const maskRef = useRef(null)
    const [mode] = useAtom(modeAtom)

    useEffect(() => {
        clearTextureCache()
    }, [scale])

    if (layout?.panelModel) {
        return (
            <>
                <ComplexPart
                    part={{ modelTree: layout.panelModel, id: '_panel' }}
                    scale={scale}
                />
            </>
        )
    }

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
                        onpointerdown={() => {
                            onClick('DOWN')
                        }}
                        onpointerup={() => {
                            onClick('UP')
                        }}
                        interactive={mode === ART_ADJUST}
                    />
                </>
            )}
            {/* {panelSvg ? (
                <Sprite
                    image={panelSvg}
                    width={panelDimensions[0] * scale}
                    height={panelDimensions[1] * scale}
                />
            ) : (
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
            )} */}
        </>
    )
}

export default Panel
