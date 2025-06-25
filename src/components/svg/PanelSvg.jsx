import React, { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

function getSvgDimensions(svgString) {
    if (!svgString) return { width: 1, height: 1 }
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return { width: 1, height: 1 }

    // Try viewBox first
    if (svgEl.hasAttribute('viewBox')) {
        const vb = svgEl.getAttribute('viewBox').split(/\s+/).map(Number)
        if (vb.length === 4) {
            return { width: vb[2], height: vb[3] }
        }
    }
    // Fallback to width/height attributes
    if (svgEl.hasAttribute('width') && svgEl.hasAttribute('height')) {
        return {
            width: parseFloat(svgEl.getAttribute('width')),
            height: parseFloat(svgEl.getAttribute('height')),
        }
    }
    return { width: 1, height: 1 }
}

const getSvgString = async (input) => {
    if (!input) {
        return null
    }

    if (input.startsWith('data:')) {
        const base64Index = input.indexOf('base64,') + 'base64,'.length
        const base64 = input.substring(base64Index)
        let svgString = atob(base64)
        // Remove units from width/height attributes in the <svg> tag
        svgString = svgString
            .replace(/(<svg[^>]*\swidth=")([^"]+)"/i, (m, p1, p2) => {
                const num = parseFloat(p2)
                return `${p1}${num}"`
            })
            .replace(/(<svg[^>]*\sheight=")([^"]+)"/i, (m, p1, p2) => {
                const num = parseFloat(p2)
                return `${p1}${num}"`
            })
        return svgString
    } else {
        const response = await fetch(input)
        let svgString = await response.text()
        // Remove units from width/height attributes in the <svg> tag
        svgString = svgString
            .replace(/(<svg[^>]*\swidth=")([^"]+)"/i, (m, p1, p2) => {
                const num = parseFloat(p2)
                return `${p1}${num}"`
            })
            .replace(/(<svg[^>]*\sheight=")([^"]+)"/i, (m, p1, p2) => {
                const num = parseFloat(p2)
                return `${p1}${num}"`
            })
        return svgString
    }
}

// Helper to extract only the children of the SVG tag as a string
const extractSvgChildren = (svgString) => {
    if (!svgString) return ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return svgString
    // Remove <defs> and <style> if present
    svgEl.querySelectorAll('defs, style').forEach((el) => el.remove())
    return svgEl.innerHTML
}

// Helper to extract viewBox from SVG string
const extractViewBox = (svgString) => {
    if (!svgString) return [0, 0, 1, 1]
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return [0, 0, 1, 1]
    if (svgEl.hasAttribute('viewBox')) {
        const vb = svgEl.getAttribute('viewBox').split(/\s+/).map(Number)
        if (vb.length === 4) return vb
    }
    // fallback: use width/height as w/h, x/y = 0
    if (svgEl.hasAttribute('width') && svgEl.hasAttribute('height')) {
        return [
            0,
            0,
            parseFloat(svgEl.getAttribute('width')),
            parseFloat(svgEl.getAttribute('height')),
        ]
    }
    return [0, 0, 1, 1]
}

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

const PanelSvg = ({ layout, scale, noArt }) => {
    const [artworkUrl] = useState('')
    const [sanitizedSvg, setSanitizedSvg] = useState('')
    const [viewBox, setViewBox] = useState([0, 0, 1, 1])
    const clipPathId = `panelClip-${layout?.panelDimensions?.[0]}-${layout?.panelDimensions?.[1]}`

    useEffect(() => {
        const getSanitizedSvg = async () => {
            if (!layout.panelSvg) {
                setSanitizedSvg('')
                setViewBox([0, 0, 1, 1])
                return
            }
            const svgString = await getSvgString(layout.panelSvg)
            // Extract only the children of the SVG tag (no outer <svg>)
            const innerSvg = extractSvgChildren(svgString)
            setSanitizedSvg(innerSvg)
            setViewBox(extractViewBox(svgString))
        }

        getSanitizedSvg()
    }, [layout, scale])

    // viewBox: [minX, minY, width, height]
    const [minX, minY] = viewBox

    return (
        <>
            {layout.panelSvg ? (
                <>
                    {sanitizedSvg && (
                        <g transform={`translate(${-minX},${-minY})`}>
                            <g
                                dangerouslySetInnerHTML={{
                                    __html: sanitizedSvg,
                                }}
                            />
                        </g>
                    )}
                </>
            ) : (
                <>
                    {!noArt ? (
                        <g clipPath={`url(#${clipPathId})`}>
                            {layout.artwork && (
                                <image
                                    href={artworkUrl}
                                    transform={`translate(${layout.artworkOffset?.[0] * scale || 0}, ${layout.artworkOffset?.[1] * scale || 0}) scale(${layout.artworkZoom * scale || 1})`}
                                />
                            )}
                        </g>
                    ) : null}
                    <rect
                        x={0}
                        y={0}
                        rx={layout?.cornerRadius * scale || 0}
                        ry={layout?.cornerRadius * scale || 0}
                        width={`${layout?.panelDimensions?.[0] * scale}`}
                        height={`${layout?.panelDimensions?.[1] * scale}`}
                        stroke="white"
                        strokeWidth={1}
                        fill={`${noArt || !layout.artwork ? 'black' : 'none'}`}
                    />
                </>
            )}
        </>
    )
}

export default PanelSvg
