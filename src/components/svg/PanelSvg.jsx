import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

const getSvgString = async (input) => {
    if (input.startsWith('data:')) {
        const base64Index = input.indexOf('base64,') + 'base64,'.length
        const base64 = input.substring(base64Index)
        return atob(base64)
    } else {
        const response = await fetch(input)
        return await response.text()
    }
}

const calculateBoundingBox = async (input, id) => {
    const svgString = await getSvgString(input)
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
    const paths = svgDoc.querySelectorAll(`path#${id}`)

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    paths.forEach((path) => {
        const pathLength = path.getTotalLength()
        for (let i = 0; i <= pathLength; i++) {
            const point = path.getPointAtLength(i)
            minX = Math.min(minX, point.x)
            minY = Math.min(minY, point.y)
            maxX = Math.max(maxX, point.x)
            maxY = Math.max(maxY, point.y)
        }
    })

    return { minX, minY, maxX, maxY }
}

const calculateSvgSize = async (input, id) => {
    const { minX, minY, maxX, maxY } = await calculateBoundingBox(input, id)
    const width = maxX - minX
    const height = maxY - minY
    return { width, height }
}

const scaleAndNormalizePathData = (
    pathData,
    scale,
    panelWidth,
    panelHeight,
    svgWidth,
    svgHeight
) => {
    if (
        !pathData ||
        !scale ||
        !panelWidth ||
        !panelHeight ||
        !svgWidth ||
        !svgHeight
    ) {
        return ''
    }

    const scaleX = (panelWidth * scale) / svgWidth
    const scaleY = (panelHeight * scale) / svgHeight
    const offsetX = 0
    const offsetY = 0

    return pathData.map((d) => {
        return d.replace(
            /([MmLlHhVvCcSsQqTtAa])([^MmLlHhVvCcSsQqTtAa]*)/g,
            (match, command, params) => {
                const scaledParams = params
                    .trim()
                    .split(/[\s,]+/)
                    .map((param, index) => {
                        const value = parseFloat(param)
                        if (isNaN(value)) {
                            return param
                        }
                        if (index % 2 === 0) {
                            // x coordinate
                            return (value - offsetX) * scaleX
                        } else {
                            // y coordinate
                            return (value - offsetY) * scaleY
                        }
                    })
                return command + scaledParams.join(' ')
            }
        )
    })
}

const extractPathData = async (input, id) => {
    try {
        const svgString = await getSvgString(input)
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')

        const paths = svgDoc.querySelectorAll(`path#${id}`)

        const pathData = []
        paths.forEach((path) => {
            pathData.push(path.getAttribute('d'))
        })

        return pathData
    } catch (error) {
        console.error('Error extracting path data:', error)
        throw error
    }
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
    const [artworkUrl, setArtworkUrl] = useState('')
    const [cutPathData, setCutPathData] = useState('')
    const [mountingPathData, setMountingPathData] = useState('')
    const clipPathId = `panelClip-${layout?.panelDimensions?.[0]}-${layout?.panelDimensions?.[1]}`

    useEffect(() => {
        const convertImg = async () => {
            setArtworkUrl(await imageUrlToDataUrl(layout.artwork))
        }

        const getPathData = async () => {
            const { panelSvg } = layout
            const extractedCutPathData = await extractPathData(
                panelSvg,
                'cut-path'
            )
            const extractedMountingPathData = await extractPathData(
                panelSvg,
                'mounting-path'
            )
            const { width, height } = await calculateSvgSize(
                panelSvg,
                'cut-path'
            )
            const normalizedCutPathData = scaleAndNormalizePathData(
                extractedCutPathData,
                scale,
                layout.panelDimensions[0],
                layout.panelDimensions[1],
                width,
                height
            )
            const normalizedMountingPathData = scaleAndNormalizePathData(
                extractedMountingPathData,
                scale,
                layout.panelDimensions[0],
                layout.panelDimensions[1],
                width,
                height
            )
            setCutPathData(normalizedCutPathData)
            setMountingPathData(normalizedMountingPathData)
        }

        convertImg()
        getPathData()
    }, [layout, scale])

    return (
        <>
            <defs>
                <clipPath id={clipPathId}>
                    <rect
                        x={0}
                        y={0}
                        rx={layout?.cornerRadius * scale || 0}
                        ry={layout?.cornerRadius * scale || 0}
                        width={`${layout?.panelDimensions?.[0] * scale}`}
                        height={`${layout?.panelDimensions?.[1] * scale}`}
                    />
                </clipPath>
            </defs>
            {layout.panelSvg ? (
                <>
                    <path d={cutPathData} fill="black" />
                    <path d={mountingPathData} fill="white" />
                </>
            ) : (
                <rect
                    x={0}
                    y={0}
                    rx={layout?.cornerRadius * scale || 0}
                    ry={layout?.cornerRadius * scale || 0}
                    width={`${layout?.panelDimensions?.[0] * scale}`}
                    height={`${layout?.panelDimensions?.[1] * scale}`}
                    stroke="white"
                    strokeWidth={1}
                    fill={`${noArt ? 'white' : 'black'}`}
                />
            )}
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
        </>
    )
}

export default PanelSvg
