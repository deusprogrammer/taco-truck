import React from 'react';
import { partTable } from '../../data/parts.table';

const ComponentMenu = ({layout, selectedPartId, onLayoutChange, onSelect, onHover}) => {
    return (
        <div className='flex flex-col gap-1 absolute left-[10px] top-[50%] max-h-[50%] max-w-[300px] p-2 translate-y-[-50%] bg-slate-400'>
            <h2 className='text-center text-[1rem] font-bold'>Component Details</h2>
            <div className='flex flex-col gap-1 overflow-y-auto'>
                <h3>Name:</h3>
                <input value={layout?.name} placeholder="part name" onChange={({target: {value}}) => {onLayoutChange({...layout, name: value})}} />
                <h3>Parts:</h3>
                {[...Object.keys(partTable), "custom"].map((key) => (
                    <React.Fragment key={key}>
                        <h4 className="bg-slate-300">{key.toUpperCase()}</h4>
                        {layout?.parts?.filter(({type}) => key === type).map(({id, type, partId, name}, index) => (
                            <button 
                                key={`element-${index}`} 
                                className={`p-3 ${selectedPartId === id ? 'bg-black text-white' : 'bg-white'} hover:bg-slate-600 hover:text-white border-solid border-2 border-black`}
                                onClick={() => {onSelect(id)}}
                                onMouseEnter={() => {onHover(id)}}
                                onMouseOut={() => {onHover(null)}}
                            >
                                <b>{name}</b>({partId})
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default ComponentMenu;