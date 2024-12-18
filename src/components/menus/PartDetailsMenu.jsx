import React from 'react';
import { calculateRelativePosition } from '../utils';
import BufferedInput from '../elements/BufferedInput';

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
        <div className='flex flex-col gap-1 absolute right-[10px] top-[50%] max-h-[50%] max-w-[300px] p-2 overflow-y-auto translate-y-[-50%] bg-slate-400'>
            <h2 className="text-center text-[1rem] font-bold">Part Details</h2>
            <div className='flex flex-col gap-1 overflow-y-auto'>
                <div className='flex flex-col gap-1'>
                    <label>type:</label>
                    <input value={selectedPart?.type} disabled />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>name:</label>
                    <input  
                        value={selectedPart?.name}
                        onChange={({target: {value}}) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, name: value});
                        }} 
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>relative to:</label>
                    <button 
                        className={`h-8 p-1 min-w-20 ${onSecondarySelectPart ? 'bg-black text-white' : 'bg-white'} border-solid border-2 border-black`}
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
                <div className='flex flex-col gap-1'>
                    <label>rotation:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.rotation || 0} 
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, rotation: parseFloat(value)});
                        }}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>x:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.position[0]} 
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, position: [parseFloat(value), selectedPart.position[1]]});
                        }}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>y:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.position[1]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, position: [selectedPart.position[0], parseFloat(value)]});
                        }}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>origin x:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.origin[0]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, origin: [parseFloat(value), selectedPart.origin[1]]});
                        }}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>origin y:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.origin[1]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, origin: [selectedPart.origin[0], parseFloat(value)]});
                        }}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>anchor x:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.anchor?.[0] || 0}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, anchor: [parseFloat(value), selectedPart?.anchor?.[1] || 0]});
                        }}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>anchor y:</label>
                    <BufferedInput
                        type="number"
                        value={selectedPart?.anchor?.[1] || 0}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {...selectedPart, anchor: [selectedPart?.anchor?.[0] || 0, parseFloat(value)]});
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default PartDetailsMenu;