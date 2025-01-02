import React, { useEffect, useState } from 'react'
import BufferedInput from '../elements/BufferedInput'
import { useAtom } from 'jotai'
import { screenHeightAtom } from '../../atoms/ViewOptions.atom'

const OptionsModal = ({ open, onClose }) => {
    const [screenHeight, setScreenHeight] = useAtom(screenHeightAtom)
    const [showRims, setShowRims] = useState(true)
    const vRes = window.screen.availHeight

    useEffect(() => {
        let dataJSON = localStorage.getItem('screen-metrics')

        if (dataJSON) {
            setScreenHeight(JSON.parse(dataJSON).screenHeight)
        }
    }, [open, setScreenHeight])

    const onSave = () => {
        localStorage.setItem(
            'screen-metrics',
            JSON.stringify({
                screenHeight,
            })
        )
    }

    if (!open) {
        return null
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            <div className="z-50 flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.5rem]">Options</h3>
                <label>Screen Height</label>
                <BufferedInput
                    className="text-black"
                    type="number"
                    value={screenHeight}
                    onChange={(value) => setScreenHeight(parseFloat(value))}
                />
                <span>Ratio: {vRes / screenHeight} pixels/mm</span>
                <h3 className="text-[1.5rem]">Real Size Button Preview</h3>
                <div>
                    <label>Show Rims</label>
                    <input
                        type="checkbox"
                        checked={showRims}
                        onChange={({ target: { checked } }) => {
                            setShowRims(checked)
                        }}
                    />
                </div>
                <div className="flex flex-row gap-1">
                    {showRims ? (
                        <>
                            <svg
                                width={50 * (vRes / screenHeight)}
                                height={50 * (vRes / screenHeight)}
                                style={{ overflow: 'visible' }}
                            >
                                <circle
                                    r={(26 / 2) * (vRes / screenHeight)}
                                    cx={100}
                                    cy={100}
                                    fill="#32CD32"
                                    stroke="black"
                                    strokeWidth={1}
                                />
                                <circle
                                    r={(19 / 2) * (vRes / screenHeight)}
                                    cx={100}
                                    cy={100}
                                    stroke="black"
                                    strokeWidth={1}
                                    fill="#32CD32"
                                />
                            </svg>
                            <svg
                                width={50 * (vRes / screenHeight)}
                                height={50 * (vRes / screenHeight)}
                                style={{ overflow: 'visible' }}
                            >
                                <circle
                                    r={(32 / 2) * (vRes / screenHeight)}
                                    cx={100}
                                    cy={100}
                                    fill="#32CD32"
                                    stroke="black"
                                    strokeWidth={1}
                                />
                                <circle
                                    r={(24 / 2) * (vRes / screenHeight)}
                                    cx={100}
                                    cy={100}
                                    fill="#32CD32"
                                    stroke="black"
                                    strokeWidth={1}
                                />
                            </svg>
                        </>
                    ) : (
                        <>
                            <svg
                                width={50 * (vRes / screenHeight)}
                                height={50 * (vRes / screenHeight)}
                                style={{ overflow: 'visible' }}
                            >
                                <circle
                                    r={(24 / 2) * (vRes / screenHeight)}
                                    cx={100}
                                    cy={100}
                                    fill="#32CD32"
                                    stroke="black"
                                    strokeWidth={1}
                                />
                            </svg>
                            <svg
                                width={50 * (vRes / screenHeight)}
                                height={50 * (vRes / screenHeight)}
                                style={{ overflow: 'visible' }}
                            >
                                <circle
                                    r={(32 / 2) * (vRes / screenHeight)}
                                    cx={100}
                                    cy={100}
                                    fill="#32CD32"
                                    stroke="black"
                                    strokeWidth={1}
                                />
                            </svg>
                        </>
                    )}
                </div>
                <div className="flex flex-row justify-center gap-1 text-[1rem]">
                    <button
                        className="bg-slate-500 p-2"
                        onClick={() => {
                            onSave()
                            onClose()
                        }}
                    >
                        Save
                    </button>
                    <button className="bg-slate-500 p-2" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OptionsModal
