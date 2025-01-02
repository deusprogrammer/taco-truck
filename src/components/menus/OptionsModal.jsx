import React, { useEffect, useState } from 'react'
import BufferedInput from '../elements/BufferedInput'
import { useAtom } from 'jotai'
import { screenHeightAtom } from '../../atoms/ViewOptions.atom'

import config from '../../../package.json'

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
            <div className="z-50 flex h-full w-full flex-col items-center justify-center gap-10 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.8rem]">Options</h3>
                <div className="w-1/3 text-center">
                    <h4 className="text-[1.3rem]">License Details</h4>
                    <h5>Taco Truck v{config.version}</h5>
                    <p>Offered under the GNU GPL V3 License</p>
                    <p>© 2025 Michael C Main</p>
                </div>
                <div className="w-1/3 text-center">
                    <h4 className="text-[1.3rem]">About Taco Truck</h4>
                    <p className="text-left">
                        Hey there, I hope you are enjoying this app and finding
                        it useful. And if you are finding it useful, would you
                        consider buying me a cup of coffee, some acrylic, or
                        some filament? Pop on down to Kofi and drop some coin in
                        my tip jar if the mood strikes you =3
                    </p>
                    <a href="https://ko-fi.com/michaelcmain52278">
                        <button className="bg-slate-500 p-2">Donate =3</button>
                    </a>
                </div>
                <div className="flex flex-col">
                    <h4 className="text-[1.5rem]">Settings</h4>
                    <label>Screen Height</label>
                    <BufferedInput
                        className="text-black"
                        type="number"
                        value={screenHeight}
                        onChange={(value) => setScreenHeight(parseFloat(value))}
                    />
                    <span>Ratio: {vRes / screenHeight} pixels/mm</span>
                </div>
                <div>
                    <h4 className="text-[1.5rem]">Real Size Button Preview</h4>
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
        </div>
    )
}

export default OptionsModal
