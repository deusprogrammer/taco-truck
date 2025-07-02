import React, { createRef, useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import { makerify, simplify } from '../utils'
import makerjs from 'makerjs'
import { CAG } from '@jscad/csg'
import stlSerializer from '@jscad/stl-serializer'

const LayoutDisplaySvg = ({ layout, scale, hideButton }) => {
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
    }

    const downloadDxf = () => {
        const blob = new Blob(
            [makerjs.exporter.toDXF(makerModel, { units: layout.units })],
            {
                type: 'image/x-dxf;charset=utf-8',
            }
        )
        saveAs(blob, `${layout.name}.dxf`)
    }

    const downloadStl = () => {
        // Convert Maker.js model to JSCAD CSG (extrude to 3D)
        const jscadModel = makerjs.exporter.toJscadCSG(CAG, makerModel, {
            maxArcFacet: 1,
            extrude: 6,
        })
        // Serialize to STL (returns an array of strings)
        const stlDataArray = stlSerializer.serialize(
            { binary: 'true' },
            jscadModel
        )
        // Join the array to get the STL string
        const stlString = stlDataArray.join('\n')
        // Create and save the blob
        const blob = new Blob([stlString], {
            type: 'text/plain;charset=utf-8',
        })
        saveAs(blob, `${layout.name}.stl`)
    }

    const simplified = simplify(layout)
    const makerified = makerify(simplified)

    const svg = makerjs.exporter.toSVG(
        makerjs.model.mirror(makerified, false, true),
        { units: 'px' }
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
                        onClick={downloadStl}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Save STL
                    </button>
                </>
            ) : null}
        </div>
    )
}

export default LayoutDisplaySvg
