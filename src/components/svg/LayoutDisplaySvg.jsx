import React, { createRef, useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import {
    makerify,
    simplify,
    augmentLayoutWithAbsolutePositions,
    BOTTOM_LAYER_BUTTON_ENLARGEMENT,
} from '../utils'
import makerjs from 'makerjs'
import { toast } from 'react-toastify'
import { usePartTable } from '../../hooks/PartTableHooks'
import JSZip from 'jszip'

const LayoutDisplaySvg = ({
    layout,
    hideButton,
    scale = 1,
    drillingGuide = false,
    experimentalClustering = false,
}) => {
    const { partTable } = usePartTable()
    const svgRef = createRef()
    const [makerModel, setMakerModel] = useState()
    const [makerModelBottom, setMakerModelBottom] = useState()
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        // Use setTimeout to defer heavy computation and allow UI to update first
        setIsProcessing(true)
        const timeoutId = setTimeout(() => {
            try {
                // Augment layout with absolute positions first
                const augmentedLayout = augmentLayoutWithAbsolutePositions(
                    { ...layout },
                    partTable
                )
                const simplified = simplify(augmentedLayout, null, partTable)

                // Generate top layer model
                const makerified = makerify(simplified, null, partTable, {
                    drillingGuide,
                    targetLayer: 'top',
                })
                setMakerModel(makerjs.model.mirror(makerified, false, true))

                // Always generate bottom layer model with enlarged buttons
                // Use clustering if experimental option is enabled
                const makerifiedBottom = makerify(simplified, null, partTable, {
                    drillingGuide,
                    buttonEnlargement: BOTTOM_LAYER_BUTTON_ENLARGEMENT,
                    useButtonClustering: experimentalClustering,
                    targetLayer: 'bottom',
                })
                setMakerModelBottom(
                    makerjs.model.mirror(makerifiedBottom, false, true)
                )
            } finally {
                setIsProcessing(false)
            }
        }, 100) // Small delay to allow checkbox to update visually

        return () => clearTimeout(timeoutId)
    }, [layout, partTable, drillingGuide, experimentalClustering])

    // Augment layout with absolute positions before simplifying
    const augmentedLayout = augmentLayoutWithAbsolutePositions(
        { ...layout },
        partTable
    )
    const simplified = simplify(augmentedLayout, null, partTable)
    const makerified = makerify(simplified, null, partTable, {
        includeGraphical: true,
        drillingGuide,
    })

    const downloadZip = async () => {
        if (!makerModel || !makerModelBottom) {
            toast.error('Models not ready yet')
            return
        }

        const zip = new JSZip()

        // Export both SVG files
        const topSvg = makerjs.exporter.toSVG(makerModel, {
            units: layout.units,
        })
        const bottomSvg = makerjs.exporter.toSVG(makerModelBottom, {
            units: layout.units,
        })
        zip.file('top-layer.svg', topSvg)
        zip.file('bottom-layer.svg', bottomSvg)

        // Export both DXF files
        const topDxf = makerjs.exporter.toDXF(makerModel, {
            units: layout.units,
        })
        const bottomDxf = makerjs.exporter.toDXF(makerModelBottom, {
            units: layout.units,
        })
        zip.file('top-layer.dxf', topDxf)
        zip.file('bottom-layer.dxf', bottomDxf)

        const blob = await zip.generateAsync({ type: 'blob' })
        saveAs(blob, `${layout.name}.zip`)
        toast.success('Exported multi-layer ZIP with SVG and DXF files')
    }

    const copyMakerJs = () => {
        navigator.clipboard.writeText(JSON.stringify(makerModel, null, 5))
        toast.success('Copied Makerjs JSON to Clipboard')
    }

    const copyTacoTruck = () => {
        navigator.clipboard.writeText(JSON.stringify(layout, null, 5))
        toast.success('Copied Taco Truck JSON to Clipboard')
    }

    const copySimplified = () => {
        navigator.clipboard.writeText(JSON.stringify(simplified, null, 5))
        toast.success('Copied Taco Truck JSON to Clipboard')
    }

    const addPadding = (model, padding) => {
        const bounds = makerjs.measure.modelExtents(model)
        const paddedWidth = bounds.width + padding * 2
        const paddedHeight = bounds.height + padding * 2

        const boundary = new makerjs.models.Rectangle(paddedWidth, paddedHeight)
        boundary.layer = 'transparent'

        return {
            models: {
                content: makerjs.model.moveRelative(model, [
                    padding - bounds.low[0],
                    padding - bounds.low[1],
                ]),
                boundary: boundary,
            },
        }
    }

    const svg = makerjs.exporter.toSVG(
        addPadding(makerjs.model.mirror(makerified, false, true), 10),
        {
            units: 'px',
            strokeWidth: '1mm',
            stroke: 'white',
            scale,
            layerOptions: {
                transparent: { stroke: 'transparent' },
            },
        }
    )

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {isProcessing && (
                <div className="text-yellow-400">Processing layout...</div>
            )}
            <div ref={svgRef} dangerouslySetInnerHTML={{ __html: svg }} />
            {!hideButton ? (
                <>
                    <button
                        onClick={downloadZip}
                        disabled={isProcessing}
                        className="rounded bg-green-600 px-6 py-3 text-lg font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : 'Export (Zip)'}
                    </button>
                    <button
                        onClick={copyMakerJs}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Copy Makerjs JSON
                    </button>
                    <button
                        onClick={copyTacoTruck}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Copy Taco Truck JSON
                    </button>
                    <button
                        onClick={copySimplified}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Copy Simplified JSON
                    </button>
                </>
            ) : null}
        </div>
    )
}

export default LayoutDisplaySvg
