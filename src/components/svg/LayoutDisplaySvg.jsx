import React from 'react'
import PartSvg from './PartSvg'
import PanelSvg from './PanelSvg'
import { saveAs } from 'file-saver'
import { svgToDxf } from '../utils'

const LayoutDisplaySvg = ({ layout }) => {
    const svgRef = React.createRef()

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

    const downloadDxf = () => {
        const svgElement = svgRef.current
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const dxfData = svgToDxf(svgData)
        const blob = new Blob([dxfData], {
            type: 'text/plain;charset=utf-8',
        })
        saveAs(blob, `${layout.name}.dxf`)
    }

    return (
        <div className="flex flex-grow flex-shrink h-0 w-full justify-center p-14">
            <div className="flex flex-col items-center">
                <svg
                    ref={svgRef}
                    width={layout.panelDimensions[0]}
                    height={layout.panelDimensions[1]}
                >
                    <PanelSvg layout={layout} />
                    {layout?.parts?.map((part, index) => (
                        <PartSvg
                            key={`part-${index}`}
                            part={part}
                            adjustments={[0, 0, 0]}
                            parent={layout}
                        />
                    ))}
                </svg>
                <button
                    onClick={downloadInkscapeSvg}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Save SVG
                </button>
            </div>
        </div>
    )
}

export default LayoutDisplaySvg
