import React, { useState } from 'react';

const SaveModal = ({open, onSaveComplete, onClose}) => {
    const [componentType, setComponentType] = useState("panelDesigns");
    const [componentName, setComponentName] = useState("new");

    if (!open) {
        return <></>;
    }

    return (
        <div className='absolute left-0 top-0 w-screen h-screen flex flex-col justify-center items-center'>
            <div className='flex flex-col gap-2 border-black border-2 bg-slate-800 text-white p-10'>
                <h3 className='text-[1.5rem]'>Save this Component?</h3>
                <label>Name</label>
                <input  className='text-black p-2' type='text' value={componentName} onChange={({target: {value}}) => setComponentName(value)} />
                <label>Type</label>
                <select className='text-black p-2' value={componentType} onChange={({target: {value}}) => setComponentType(value)}>
                    <option value='panelDesigns'>Panel Design</option>
                    <option value='customParts'>Custom Component</option>
                </select>
                <div></div>
                <div className='flex flex-row gap-1 text-[1rem]'>
                    <button className='p-2 bg-slate-500' onClick={() => {onSaveComplete(componentName, componentType); onClose();}}>Save</button>
                    <button className='p-2 bg-slate-500' onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default SaveModal;