import React, { useEffect, useState } from 'react'

const SaveModal = ({ open, name, onSaveComplete, onClose }) => {
    const [componentType, setComponentType] = useState('panelDesigns')
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
                <input
                    className="p-2 text-black"
                    type="text"
                    value={componentName}
                    onChange={({ target: { value } }) =>
                        setComponentName(value)
                    }
                />
                <label>Type</label>
                <select
                    className="p-2 text-black"
                    value={componentType}
                    onChange={({ target: { value } }) =>
                        setComponentType(value)
                    }
                >
                    <option value="panelDesigns">Panel Design</option>
                    <option value="customParts">Custom Component</option>
                </select>
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
