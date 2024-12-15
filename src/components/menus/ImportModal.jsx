import React, { useEffect, useState } from 'react';

const ImportModal = ({open, onImportComplete, onClose}) => {
    const [customParts, setCustomParts] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);

    useEffect(() => {
        let dataJSON = localStorage.getItem("taco-truck-data");

        if (!dataJSON) {
            return;
        }

        setCustomParts(JSON.parse(dataJSON).customParts);
    }, [setCustomParts, open]);

    if (!open) {
        return <></>;
    }

    return (
        <div className='absolute left-0 top-0 w-screen h-screen flex flex-col justify-center items-center'>
            <div className='flex flex-col gap-2 border-black border-2 bg-slate-800 text-white p-10'>
                <h3 className='text-[1.5rem]'>Import</h3>
                <select 
                    className='text-black p-2' 
                    multiple={true} 
                    value={selectedParts} 
                    onChange={({target: {selectedOptions}}) => {
                        const options = [...selectedOptions];
                        const values = options.map(option => option.value);
                        setSelectedParts(values)
                    }}
                >
                    {customParts.map(({name, id}) => (
                        <option key={`cp-${id}`} value={id}>{name}</option>
                    ))}
                </select>
                <div className='flex flex-row gap-1 text-[1rem]'>
                    <button className='p-2 bg-slate-500' onClick={() => {onImportComplete(selectedParts); onClose();}}>Import</button>
                    <button className='p-2 bg-slate-500' onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ImportModal;