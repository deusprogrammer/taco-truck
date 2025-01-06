import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

export const imageUrlToDataUrl = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error converting image URL to data URL:', error)
        throw error
    }
}

const PanelSvg = ({ layout, units, scale }) => {
    const [artworkUrl, setArtworkUrl] = useState('')
    const clipPathId = `panelClip-${layout?.panelDimensions?.[0]}-${layout?.panelDimensions?.[1]}`

    useEffect(() => {
        const convertImg = async () => {
            setArtworkUrl(await imageUrlToDataUrl(layout.artwork))
        }

        convertImg()
    }, [layout])

    if (units) {
        scale = 1
    }

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
                        href={artworkUrl}
                        transform={`translate(${layout.artworkOffset?.[0] * scale || 0}${units ?? ''}, ${layout.artworkOffset?.[1] * scale || 0}${units ?? ''}) scale(${layout.artworkZoom * scale || 1})`}
                    />
                )}
            </g>
        </>
    )
}

export default PanelSvg
