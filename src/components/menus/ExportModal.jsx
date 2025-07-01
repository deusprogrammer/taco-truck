import React from 'react'
import LayoutDisplaySvg from '../svg/LayoutDisplaySvg'
import { useState } from 'react'

const ExportModal = ({ open, layout, onClose }) => {
    const [drillingGuide, setDrillingGuide] = useState(false)

    if (!open) {
        return <></>
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            <div className="flex flex-col gap-2 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.5rem]">Export Layout to SVG</h3>
                <div>
                    <input
                        type="checkbox"
                        checked={drillingGuide}
                        onChange={({ target: { checked } }) =>
                            setDrillingGuide(checked)
                        }
                    />
                    <label>Drilling Guide</label>
                </div>
                <LayoutDisplaySvg
                    layout={layout}
                    drillingGuide={drillingGuide}
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
