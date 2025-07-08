import React, { useEffect, useState } from 'react'
import BufferedInput from '../elements/BufferedInput'

const SaveModal = ({ open, name, componentType, onSaveComplete, onClose }) => {
    const [componentName, setComponentName] = useState('new')

    useEffect(() => {
        setComponentName(name)
    }, [name])

    if (!open) {
        return <></>
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            <div className="flex flex-col gap-2 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.5rem]">Save this Component?</h3>
                <label>Name</label>
                <BufferedInput
                    className="p-2 text-black"
                    type="text"
                    value={componentName}
                    onChange={(value) => setComponentName(value)}
                />
                <div></div>
                <div className="flex flex-row gap-1 text-[1rem]">
                    <button
                        className="bg-slate-500 p-2"
                        onClick={() => {
                            onSaveComplete(componentName, componentType, true)
                            onClose()
                        }}
                    >
                        Save (Local)
                    </button>
                    <button
                        className="bg-slate-500 p-2"
                        onClick={() => {
                            onSaveComplete(componentName, componentType)
                            onClose()
                        }}
                    >
                        Save (Cloud)
                    </button>
                    <button className="bg-slate-500 p-2" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SaveModal
