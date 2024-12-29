import React, { createRef } from 'react'
import PartSvg from './PartSvg'
import PanelSvg from './PanelSvg'
import { saveAs } from 'file-saver'
import { calculateSizeOfPart } from '../utils'

const LayoutDisplaySvg = ({ layout, scale, hideButton }) => {
    const svgRef = createRef()
    const [partsWidth, partsHeight] = calculateSizeOfPart({
        type: 'custom',
        layout: layout,
    })

    const convertToInkscapeSvg = (svgData) => {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgData, 'image/svg+xml')
        const svgElement = svgDoc.documentElement

        // Add Inkscape-specific attributes
        svgElement.setAttribute(
            'xmlns:inkscape',
            'http://www.inkscape.org/namespaces/inkscape'
        )
        svgElement.setAttribute(
            'xmlns:sodipodi',
            'http://inkscape.sourceforge.net/DTD/sodipodi-0.dtd'
        )
        svgElement.setAttribute('xmlns:cc', 'http://creativecommons.org/ns#')
        svgElement.setAttribute('xmlns:dc', 'http://purl.org/dc/elements/1.1/')
        svgElement.setAttribute(
            'xmlns:rdf',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        )

        // Add metadata element
        const metadata = svgDoc.createElementNS(
            'http://www.w3.org/2000/svg',
            'metadata'
        )
        const rdf = svgDoc.createElementNS(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            'rdf:RDF'
        )
        const work = svgDoc.createElementNS(
            'http://creativecommons.org/ns#',
            'cc:Work'
        )
        const format = svgDoc.createElementNS(
            'http://purl.org/dc/elements/1.1/',
            'dc:format'
        )
        format.textContent = 'image/svg+xml'
        work.appendChild(format)
        rdf.appendChild(work)
        metadata.appendChild(rdf)
        svgElement.insertBefore(metadata, svgElement.firstChild)

        return new XMLSerializer().serializeToString(svgElement)
    }

    const downloadInkscapeSvg = () => {
        const svgElement = svgRef.current
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const inkscapeSvgData = convertToInkscapeSvg(svgData)
        const blob = new Blob([inkscapeSvgData], {
            type: 'image/svg+xml;charset=utf-8',
        })
        saveAs(blob, `${layout.name}.svg`)
    }

    const svgWidth =
        layout?.panelDimensions[0] !== 0
            ? layout?.panelDimensions[0]
            : partsWidth
    const svgHeight =
        layout?.panelDimensions[1] !== 0
            ? layout?.panelDimensions[1]
            : partsHeight

    return (
        <div className="flex flex-col items-center gap-4">
            <svg
                ref={svgRef}
                width={svgWidth * scale}
                height={svgHeight * scale}
            >
                <PanelSvg layout={layout} scale={scale} />
                {layout?.parts?.map((part, index) => (
                    <PartSvg
                        key={`partsvg-${part.id || index}`}
                        part={part}
                        parent={layout}
                        scale={scale}
                    />
                ))}
            </svg>
            {!hideButton ? (
                <button
                    onClick={downloadInkscapeSvg}
                    className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                >
                    Save SVG
                </button>
            ) : null}
        </div>
    )
}

export default LayoutDisplaySvg
