import React from 'react'
import LayoutDisplaySvg from '../svg/LayoutDisplaySvg'
import { useState } from 'react'

const ExportModal = ({ open, layout, onClose }) => {
    const [drillingGuide, setDrillingGuide] = useState(false)
    const [experimentalClustering, setExperimentalClustering] = useState(false)

    // Check if any custom parts have rotation or flipping
    const hasRotatedOrFlippedCustomParts = React.useMemo(() => {
        if (!layout || !layout.parts) return false

        const checkParts = (parts) => {
            for (const part of parts) {
                if (part.type === 'custom') {
                    // rotation should be a number, not an array
                    const rotation = typeof part.rotation === 'number' ? part.rotation : 0
                    if (rotation !== 0 || part.flipX === true || part.flipY === true) {
                        return true
                    }
                    // Recursively check nested custom parts
                    if (part.layout && part.layout.parts) {
                        if (checkParts(part.layout.parts)) {
                            return true
                        }
                    }
                }
            }
            return false
        }

        return checkParts(layout.parts)
    }, [layout])

    if (!open) {
        return <></>
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            <div className="flex flex-col gap-2 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.5rem]">Export Layout</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="drilling-guide"
                        checked={drillingGuide}
                        onChange={({ target: { checked } }) =>
                            setDrillingGuide(checked)
                        }
                        className="cursor-pointer"
                    />
                    <label htmlFor="drilling-guide" className="cursor-pointer">
                        Drilling Guide
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="experimental-clustering"
                        checked={experimentalClustering}
                        disabled={hasRotatedOrFlippedCustomParts}
                        onChange={({ target: { checked } }) =>
                            setExperimentalClustering(checked)
                        }
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <label
                        htmlFor="experimental-clustering"
                        className={
                            hasRotatedOrFlippedCustomParts
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'
                        }
                    >
                        Experimental: Cluster Buttons (Bottom Layer)
                        {hasRotatedOrFlippedCustomParts && (
                            <span className="ml-2 text-sm text-yellow-400">
                                (Disabled: rotated/flipped custom parts
                                detected)
                            </span>
                        )}
                    </label>
                </div>
                <LayoutDisplaySvg
                    layout={layout}
                    drillingGuide={drillingGuide}
                    experimentalClustering={experimentalClustering}
                    noArt={true}
                    scale={1}
                    units="mm"
                    hidden={true}
                    hideButton={false}
                />
                <button className="bg-slate-500 p-2" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default ExportModal
