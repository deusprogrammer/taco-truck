import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { augmentLayoutWithAbsolutePositions, makerify, simplify } from '../components/utils'
import { getComponent, getProject } from '../api/Api'
import { usePartTable } from '../hooks/PartTableHooks'
import { GenericButton } from '../components/elements/Buttons'
import ImageMasker from '../components/ImageMasker'
import makerjs from 'makerjs'

const ArtDesignerRoute = () => {
    const { type, id } = useParams()
    const [searchParams] = useSearchParams()
    const { partTable } = usePartTable()
    const fileInputRef = useRef()

    const [layout, setLayout] = useState({
        units: 'mm',
        panelDimensions: [0, 0],
        parts: [],
    })

    const [svgContent, setSvgContent] = useState('')
    const [imageUrl, setImageUrl] = useState(null)
    const [maskedResult, setMaskedResult] = useState(null)

    const loadLocal = useCallback(
        (type, id) => {
            let dataJSON = localStorage.getItem('taco-truck-data')

            if (!dataJSON) {
                return
            }

            const data = JSON.parse(dataJSON)

            switch (type) {
                case 'projects': {
                    const project = data.panelDesigns.find(
                        (design) => id === design.id
                    )
                    setLayout(
                        augmentLayoutWithAbsolutePositions(project, partTable)
                    )
                    break
                }
                case 'parts': {
                    const customPart = data.customParts.find(
                        (part) => id === part.id
                    )
                    setLayout(
                        augmentLayoutWithAbsolutePositions(
                            customPart,
                            partTable
                        )
                    )
                    break
                }
                default:
                    break
            }
        },
        [partTable]
    )

    const loadCloud = useCallback(
        async (type, id) => {
            try {
                let component
                if (type === 'parts') {
                    component = await getComponent(id)
                    component = component.layout
                } else {
                    component = await getProject(id)
                }

                setLayout(
                    augmentLayoutWithAbsolutePositions(component, partTable)
                )
            } catch (e) {
                console.error('Error getting document:', e)
            }
        },
        [partTable]
    )

    // Load layout
    useEffect(() => {
        if (!type || !id) {
            const cacheJSON = localStorage.getItem('taco-truck-cache')
            let cachedLayout = {
                units: 'mm',
                panelDimensions: [0, 0],
                parts: [],
            }

            if (cacheJSON) {
                cachedLayout = JSON.parse(cacheJSON)
            }

            setLayout(
                augmentLayoutWithAbsolutePositions(cachedLayout, partTable)
            )
            return
        }

        if (searchParams.has('isLocal')) {
            loadLocal(type, id)
        } else {
            loadCloud(type, id)
        }
    }, [type, id, searchParams, partTable, loadLocal, loadCloud])

    // Generate SVG from layout using Maker.js
    useEffect(() => {
        if (!partTable || Object.keys(partTable).length === 0) return
        if (!layout?.parts) return

        try {
            const makerifyOptions = {}
            if (searchParams.has('layer')) makerifyOptions.targetLayer = searchParams.get('layer')
            if (searchParams.get('experimental') === 'true') makerifyOptions.useButtonClustering = true

            const augmented = augmentLayoutWithAbsolutePositions(
                { ...layout },
                partTable
            )
            const simplified = simplify(augmented, null, partTable)
            const makerified = makerify(simplified, null, partTable, makerifyOptions)
            const mirrored = makerjs.model.mirror(makerified, false, true)
            const svgText = makerjs.exporter.toSVG(mirrored, {
                units: layout.units || 'mm',
            })
            setSvgContent(svgText)
        } catch (e) {
            console.error('Error generating SVG:', e)
        }
    }, [layout, partTable, searchParams])

    const handleFileChange = useCallback(
        (e) => {
            const file = e.target.files[0]
            if (!file) return
            const prevUrl = imageUrl
            setImageUrl(URL.createObjectURL(file))
            setMaskedResult(null)
            if (prevUrl) URL.revokeObjectURL(prevUrl)
        },
        [imageUrl]
    )

    const handleDownload = useCallback(() => {
        if (!maskedResult?.dataUrl) return
        const a = document.createElement('a')
        a.href = maskedResult.dataUrl
        a.download = `${layout?.name || 'artwork'}_masked.png`
        a.click()
    }, [maskedResult, layout])

    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl)
        }
    }, [imageUrl])

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#1099bb',
                overscrollBehavior: 'none',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    padding: 8,
                    flexShrink: 0,
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <GenericButton onClick={() => fileInputRef.current.click()}>
                    Open Image
                </GenericButton>
                {maskedResult?.dataUrl && (
                    <GenericButton onClick={handleDownload}>
                        Save PNG
                    </GenericButton>
                )}
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ImageMasker
                    svgContent={svgContent}
                    imageUrl={imageUrl}
                    onChange={setMaskedResult}
                />
            </div>
        </div>
    )
}

export default ArtDesignerRoute
