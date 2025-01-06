import React, { createRef } from 'react'
import PartSvg from './PartSvg'
import PanelSvg from './PanelSvg'
import { saveAs } from 'file-saver'
import { calculateSizeOfPart } from '../utils'

const LayoutDisplaySvg = ({
    layout,
    scale,
    drillingGuide,
    units,
    hideButton,
}) => {
    const svgRef = createRef()
    const [partsWidth, partsHeight] = calculateSizeOfPart({
        type: 'custom',
        layout: layout,
    })

    const downloadInkscapeSvg = () => {
        const svgElement = svgRef.current
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], {
            type: 'image/svg+xml;charset=utf-8',
        })
        saveAs(blob, `${layout.name}.svg`)
    }

    if (units === 'mm') {
        scale = 1
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
        <div className="flex flex-col items-center justify-center gap-4">
            <svg
                ref={svgRef}
                width={`${svgWidth * scale}${units ?? ''}`}
                height={`${svgHeight * scale}${units ?? ''}`}
                viewBox={`0 0 ${svgWidth * scale} ${svgHeight * scale}`}
            >
                <PanelSvg layout={layout} scale={scale} units={units} />
                {layout?.parts?.map((part, index) => (
                    <PartSvg
                        key={`partsvg-${part.id || index}`}
                        drillingGuide={drillingGuide}
                        units={units}
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
