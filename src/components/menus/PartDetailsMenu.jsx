import React from 'react';
import { partTable } from '../../data/parts.table';

const PartDetailsMenu = ({selectedPart, onUpdatePart, onSetSecondarySelect}) => {
    if (!selectedPart) {
        return null;
    }

    return (
        <div className='flex flex-row justify-around items-center gap-10 absolute left-[0px] bottom-[0px] w-full z-50 border-solid border-white bg-slate-400'>
            <div className='flex flex-row gap-1 items-center'>
                <label>Type:</label>
                <input className='text-center' value={selectedPart?.type} />
            </div>
            <div className='flex flex-row gap-1 items-center'>
                <label>Name:</label>
                <input 
                    className='text-center' 
                    value={selectedPart?.name}
                    onChange={({target: {value}}) => {
                        onUpdatePart(selectedPart.id, {...selectedPart, name: value});
                    }} 
                />
            </div>
            <div className='flex flex-row gap-1 items-center'>
                <label>Part Type:</label>
                <select 
                    className='text-center'
                    value={selectedPart?.type}
                    onChange={({target: {value}}) => {
                        onUpdatePart(selectedPart.id, {...selectedPart, type: value})
                    }}
                >
                    {Object.keys(partTable).map((key) => (
                        <option>{key}</option>
                    ))}
                </select>
            </div>
            <div className='flex flex-row gap-1 items-center'>
                <label>Part Id:</label>
                <select 
                    className='text-center'
                    value={selectedPart?.partId}
                    onChange={({target: {value}}) => {
                        onUpdatePart(selectedPart.id, {...selectedPart, partId: value})
                    }}
                >
                    {Object.keys(partTable[selectedPart?.type]).map((key) => (
                        <option>{key}</option>
                    ))}
                </select>
            </div>
            <div className='flex flex-row gap-1 items-center'>
                <label>x:</label>
                <input 
                    className='text-center' 
                    value={selectedPart?.position[0]} 
                    onChange={({target: {value}}) => {
                        onUpdatePart(selectedPart.id, {...selectedPart, position: [parseInt(value), selectedPart.position[1]]});
                    }}
                />
            </div>
            <div className='flex flex-row gap-1 items-center'>
                <label>y:</label>
                <input 
                    className='text-center' 
                    value={selectedPart?.position[1]}
                    onChange={({target: {value}}) => {
                        onUpdatePart(selectedPart.id, {...selectedPart, position: [selectedPart.position[0], parseInt(value)]});
                    }}
                />
            </div>
            <div className='flex flex-row gap-1 items-center'>
                <label>Relative to:</label>
                <button 
                    className="h-8 p-1 bg-white" 
                    onClick={() => {
                        console.log("RELATIVE CLICKED");
                        onSetSecondarySelect(
                            () => ((relativePart) => (
                                onUpdatePart(selectedPart.id, {...selectedPart, relativeTo: relativePart.id})
                            ))
                        );
                    }}
                >
                    {selectedPart?.relativeTo ? `${selectedPart?.type}-${selectedPart?.id}` : "Select"}
                </button>
            </div>
        </div>
    );
}

export default PartDetailsMenu;