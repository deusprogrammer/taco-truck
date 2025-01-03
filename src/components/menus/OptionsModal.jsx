import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BufferedInput from '../elements/BufferedInput'
import { useAtom } from 'jotai'
import { screenHeightAtom } from '../../atoms/ViewOptions.atom'

import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase.config'

const OptionsModal = ({ open, onClose }) => {
    const [screenHeight, setScreenHeight] = useAtom(screenHeightAtom)
    const [presets, setPresets] = useState([])
    const [showRims, setShowRims] = useState(true)
    const [presetName, setPresetName] = useState('')
    const [showPresetModal, setShowPresetModal] = useState(false)
    const vRes = window.screen.availHeight

    const fetchPresets = async () => {
        const querySnapshot = await getDocs(collection(db, 'screenMetrics'))
        const retrieved = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        setPresets(retrieved)
    }

    const storePreset = async (preset) => {
        await addDoc(collection(db, 'screenMetrics'), preset)
        fetchPresets()
    }

    useEffect(() => {
        let dataJSON = localStorage.getItem('screen-metrics')

        fetchPresets()

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
        setScreenHeight(screenHeight)
    }

    if (!open) {
        return null
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            {showPresetModal ? (
                <div className="absolute left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center">
                    <div className="flex flex-col gap-5 border-2 border-white bg-black p-10 text-center text-white">
                        <h3 className="text-[1.8rem]">Save Preset</h3>
                        <label>Give your preset a name</label>
                        <BufferedInput
                            className="text-black"
                            type="text"
                            value={presetName}
                            onChange={(value) => setPresetName(value)}
                        />
                        <button
                            className="bg-slate-500 p-2"
                            onClick={() => {
                                storePreset({
                                    name: presetName,
                                    height: screenHeight,
                                })
                                setShowPresetModal(false)
                            }}
                        >
                            Save
                        </button>
                        <button
                            className="bg-slate-500 p-2"
                            onClick={() => setShowPresetModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : null}
            <div className="z-40 flex h-full w-full flex-col items-center justify-center gap-10 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.8rem]">Options</h3>
                <div className="flex flex-col gap-1">
                    <h4 className="text-[1.5rem]">Settings</h4>
                    <label>Screen Height</label>
                    <div className="flex flex-row gap-1">
                        <BufferedInput
                            className="text-black"
                            type="number"
                            value={screenHeight}
                            onChange={(value) =>
                                setScreenHeight(parseFloat(value))
                            }
                        />
                        <button
                            className="bg-slate-500 p-2"
                            onClick={() => setShowPresetModal(true)}
                        >
                            Add to presets
                        </button>
                    </div>
                    <label>Pre-Sets</label>
                    <select
                        className="text-black"
                        value={screenHeight}
                        onChange={({ target: { value } }) =>
                            setScreenHeight(value)
                        }
                    >
                        <option>Check a list of pre-measured monitors</option>
                        {presets.map((monitor) => (
                            <option key={monitor.id} value={monitor.height}>
                                {monitor.name}
                            </option>
                        ))}
                    </select>
                    <Link to="/calibration">
                        <button className="bg-slate-500 p-2">
                            Card Calibration
                        </button>
                    </Link>
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
