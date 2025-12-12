import React from 'react'
import LayoutDisplaySvg from '../svg/LayoutDisplaySvg'
import { useState } from 'react'

const ExportModal = ({ open, layout, onClose }) => {
    const [drillingGuide, setDrillingGuide] = useState(false)
    const [experimentalClustering, setExperimentalClustering] = useState(false)

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
                        onChange={({ target: { checked } }) =>
                            setExperimentalClustering(checked)
                        }
                        className="cursor-pointer"
                    />
                    <label
                        htmlFor="experimental-clustering"
                        className="cursor-pointer"
                    >
                        Experimental: Cluster Buttons (Bottom Layer)
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
