import React from 'react';
import { partTable } from '../../data/parts.table';
import { calculateRelativePosition } from '../utils';

const PartDetailsMenu = ({layout, selectedPart, onUpdatePart, onSecondarySelectPart, onSetSecondarySelect}) => {
    if (!selectedPart) {
        return null;
    }

    const adjustPositionToRelative = (part, referencePart) => {
        let copy = {...part};

        const relativePartPosition = calculateRelativePosition(referencePart, layout.parts, 0, 0);

        copy.position[0] -= relativePartPosition[0];
        copy.position[1] -= relativePartPosition[1];

        return copy;
    }

    return (
        <div className='flex flex-row justify-around items-center gap-10 px-2 absolute left-[0px] bottom-[0px] w-full z-50 border-solid border-white bg-slate-400'>
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
                    {Object.keys(selectedPart?.type === "custom" ? {custom : {custom: {}}} : partTable).map((key) => (
                        <option key={key}>{key}</option>
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
                    {Object.keys(partTable[selectedPart?.type] || {custom: {}}).map((key) => (
                        <option key={key}>{key}</option>
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
                    className={`h-8 p-1 min-w-20 ${onSecondarySelectPart ? 'bg-black text-white' : 'bg-white'}`}
                    onClick={() => {
                        onSetSecondarySelect(
                            () => ((relativePart) => (
                                onUpdatePart(selectedPart.id, {...adjustPositionToRelative(selectedPart, relativePart), relativeTo: relativePart.id})
                            ))
                        );
                    }}
                >
                    {selectedPart?.relativeTo ? `${selectedPart?.name}` : "Select"}
                </button>
            </div>
        </div>
    );
}

export default PartDetailsMenu;