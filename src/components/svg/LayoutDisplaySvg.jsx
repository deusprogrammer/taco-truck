import React, { createRef, useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import { makerify, simplify } from '../utils'
import makerjs from 'makerjs'
import { toast } from 'react-toastify'

const LayoutDisplaySvg = ({ layout, hideButton }) => {
    const svgRef = createRef()
    const [makerModel, setMakerModel] = useState()

    useEffect(() => {
        const simplified = simplify(layout)
        const makerified = makerify(simplified)
        setMakerModel(makerjs.model.mirror(makerified, false, true))
    }, [layout])

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

    const simplified = simplify(layout)
    const makerified = makerify(simplified, null, { includeGraphical: true })

    console.log('SIMPLIFIED: ' + JSON.stringify(simplified, null, 5))

    const svg = makerjs.exporter.toSVG(
        makerjs.model.mirror(makerified, false, true),
        {
            units: 'px',
            strokeWidth: '1mm',
            stroke: 'white',
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
                </>
            ) : null}
        </div>
    )
}

export default LayoutDisplaySvg
