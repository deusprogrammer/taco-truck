import React, { createRef, useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import { makerify, simplify } from '../utils'
import makerjs from 'makerjs'
import { toast } from 'react-toastify'

const LayoutDisplaySvg = ({ layout, hideButton, scale = 1 }) => {
    const svgRef = createRef()
    const [makerModel, setMakerModel] = useState()

    useEffect(() => {
        const simplified = simplify(layout)
        const makerified = makerify(simplified)
        setMakerModel(makerjs.model.mirror(makerified, false, true))
    }, [layout])

    const simplified = simplify(layout)
    const makerified = makerify(simplified, null, { includeGraphical: true })

    const downloadSvg = () => {
        const blob = new Blob(
            [makerjs.exporter.toSVG(makerModel, { units: layout.units })],
            {
                type: 'image/svg+xml;charset=utf-8',
            }
        )
        saveAs(blob, `${layout.name}.svg`)
        toast.success('Saved SVG')
    }

    const downloadDxf = () => {
        const blob = new Blob(
            [makerjs.exporter.toDXF(makerModel, { units: layout.units })],
            {
                type: 'image/x-dxf;charset=utf-8',
            }
        )
        saveAs(blob, `${layout.name}.dxf`)
        toast.success('Saved DXF')
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

    console.log('SIMPLIFIED: ' + JSON.stringify(simplified, null, 5))

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
            <div ref={svgRef} dangerouslySetInnerHTML={{ __html: svg }} />
            {!hideButton ? (
                <>
                    <button
                        onClick={downloadSvg}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Save SVG
                    </button>
                    <button
                        onClick={downloadDxf}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Save DXF
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
