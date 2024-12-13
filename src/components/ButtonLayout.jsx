import React, { createRef, useCallback, useEffect, useState } from 'react';
import { Container, Graphics, Stage } from '@pixi/react';
import { getPart } from './utils';
import Button from './parts/Button';
import ModeSelect, { ADD, PAN, SELECT } from './elements/ModeSelect';
import { useContainerSize, useMouseDrag, useMousePosition } from '../hooks/MouseHooks';
import { PartSelectionButton } from './elements/Buttons';
import { partTable } from '../data/parts.table';

const ButtonLayout = ({layout, onLayoutChange}) => {
    const componentRef = createRef();
    const containerRef = createRef();

    const [width, height] = useContainerSize(containerRef);
    const [mouseX, mouseY] = useMousePosition(containerRef);
    const [deltaX, deltaY, dragEnded] = useMouseDrag(containerRef);
    
    const [currentScale, setCurrentScale] = useState(5.0);
    const [containerRect, setContainerRect] = useState(null);

    const [mode, setMode] = useState(SELECT);
    const [placingPartId, setPlacingPartId] = useState("SANWA-24mm");
    const [placingPartType, setPlacingPartType] = useState("button");
    const [afterSelect, setAfterSelect] = useState(null);
    const [workPiecePosition, setWorkPiecePosition] = useState([width / 2, height / 2]);

    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);

    const generateUUID = () => {
        let d = new Date().getTime();
        if (typeof performance !== 'undefined' && performance.now) {
          d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          let r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    const saveComponent = () => {

    }

    const addPart = useCallback((evt) => {
        if (mode !== ADD) {
            return;
        }

        const partsCopy = [...layout.parts];
        partsCopy.push(
            {
                id: generateUUID(),
                name: `${placingPartType}-${placingPartId}`,
                type: placingPartType,
                partId: placingPartId,
                position: [evt.offsetX/currentScale, evt.offsetY/currentScale],
                origin: [0, 0]
            }
        );
        const updatedLayout = {...layout, parts: partsCopy};
        onLayoutChange(updatedLayout);
    }, [layout, onLayoutChange, mode, currentScale]);

    const selectPlacingPart = (partType, partId) => {
        setPlacingPartType(partType);
        setPlacingPartId(partId);
    }

    const selectPart = (selectedPart) => {
        setSelected(selectedPart.id);
    }

    const updatePart = (partId, newPart) => {
        const parts = [...layout.parts];
        const index = parts.findIndex(({id}) => id === partId);

        parts[index] = newPart;
        const updatedLayout = {...layout, parts};

        onLayoutChange(updatedLayout);
        setAfterSelect(null);
    }

    useEffect(() => {
        const ele = containerRef.current;
        
        ele.addEventListener('click', addPart);
        return () => {
            ele.removeEventListener('click', addPart);
        }
    }, [addPart, containerRef]);

    useEffect(() => {
        if (dragEnded && mode === PAN) {
            setWorkPiecePosition([workPiecePosition[0] - deltaX, workPiecePosition[1] - deltaY]);
        }
    }, [dragEnded, mode]);

    useEffect(() => {
        if (componentRef?.current) {
            setContainerRect(componentRef.current.getLocalBounds());
        }
    }, [componentRef]);

    let component;
    switch (mode) {
        case ADD:
            component = (
                <Button 
                    scale={currentScale} 
                    part={{
                        partId: placingPartId,
                        type: placingPartType,
                        position: [mouseX/currentScale, mouseY/currentScale], 
                        origin: [0, 0]
                    }} 
                    parent={{
                        parts: layout.parts,
                        panelDimensions: [width, height]
                    }} 
                    onClick={() => {}}
                />
            );
            break;
        default:
            break;
    }

    const selectedPart = layout.parts.find(({id}) => id === selected);

    return (
        <div className="flex flex-col w-full h-screen">
            <ModeSelect currentMode={mode} onModeChange={setMode} onSave={saveComponent} />

            { /** TODO Refactor this into it's own component */}
            {mode === ADD ? 
                <div className="flex flex-row justify-around items-center gap-10 w-full p-2 bg-slate-400">
                    <PartSelectionButton placingPart={placingPartId} partType="button" partId="SANWA-24mm" name="SANWA-24mm Button" onClick={selectPlacingPart} />
                    <PartSelectionButton placingPart={placingPartId} partType="button" partId="SANWA-30mm" name="SANWA-30mm Button" onClick={selectPlacingPart} />
                    <PartSelectionButton placingPart={placingPartId} partType="hole" partId="M4" name="M4 Hole" onClick={selectPlacingPart} />
                    <PartSelectionButton placingPart={placingPartId} partType="hole" partId="M5" name="M5 Hole" onClick={selectPlacingPart} />
                    <PartSelectionButton placingPart={placingPartId} partType="hole" partId="M6" name="M6 Hole" onClick={selectPlacingPart} />
                    <PartSelectionButton placingPart={placingPartId} partType="hole" partId="M7" name="M7 Hole" onClick={selectPlacingPart} />
                    <PartSelectionButton placingPart={placingPartId} partType="hole" partId="M8" name="M8 Hole" onClick={selectPlacingPart} />
                </div> 
            : null}

            { /** TODO Refactor this into it's own component */}
            <div className='flex flex-col gap-1 absolute left-[10px] top-[50%] h-[600px] w-[200px] overflow-y-auto translate-y-[-50%] bg-slate-400'>
                <h2>Component</h2>
                <h2>Name:</h2>
                <input value={layout.name} placeholder="part name" onChange={({target: {value}}) => {onLayoutChange({...layout, name: value})}} />
                <h3>Parts:</h3>
                {Object.keys(partTable).map((key) => (
                    <>
                        <h4 className="bg-slate-300">{key.toUpperCase()}</h4>
                        {layout.parts.filter(({type}) => key === type).map(({id, type, partId, name}, index) => (
                            <button 
                                key={`element-${index}`} 
                                className='p-3 bg-white hover:bg-slate-400 hover:text-white' 
                                onClick={() => {setSelected(id)}}
                                onMouseEnter={() => {setHovered(id)}}
                                onMouseOut={() => {setHovered(null)}}
                            >
                                <b>{name}</b>({partId})
                            </button>
                        ))}
                    </>
                ))}
            </div>

            { /** TODO Refactor this into it's own component */}
            <div ref={containerRef} className='flex-grow flex-shrink-0 w-full'>
                <Stage width={width} height={height} renderOnComponentChange={false} options={{ background: 0x1099bb }}>
                    {component}
                    <Container 
                        ref={componentRef}
                        x={!dragEnded && mode === PAN ? workPiecePosition[0] - deltaX : workPiecePosition[0]} 
                        y={!dragEnded && mode === PAN ? workPiecePosition[1] - deltaY : workPiecePosition[1]} 
                        anchor={0.5} 
                        sortChildren={true}
                    >
                        {layout.parts.map((part, index) => getPart(part, currentScale, {...layout, panelDimensions: [width, height]}, index, selected, hovered, afterSelect || selectPart))}
                    </Container>
                </Stage>
            </div>

            { /** TODO Refactor this into it's own component */}
            {selectedPart ? <div className='flex flex-row justify-around items-center gap-10 absolute left-[0px] bottom-[0px] w-full z-50 border-solid border-white bg-slate-400'>
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
                            updatePart(selectedPart.id, {...selectedPart, name: value});
                        }} 
                    />
                </div>
                <div className='flex flex-row gap-1 items-center'>
                    <label>Part Type:</label>
                    <select 
                        className='text-center'
                        value={selectedPart?.type}
                        onChange={({target: {value}}) => {
                            updatePart(selectedPart.id, {...selectedPart, type: value})
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
                            updatePart(selectedPart.id, {...selectedPart, partId: value})
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
                            updatePart(selectedPart.id, {...selectedPart, position: [parseInt(value), selectedPart.position[1]]});
                        }}
                    />
                </div>
                <div className='flex flex-row gap-1 items-center'>
                    <label>y:</label>
                    <input 
                        className='text-center' 
                        value={selectedPart?.position[1]}
                        onChange={({target: {value}}) => {
                            updatePart(selectedPart.id, {...selectedPart, position: [selectedPart.position[0], parseInt(value)]});
                        }}
                    />
                </div>
                <div className='flex flex-row gap-1 items-center'>
                    <label>Relative to:</label>
                    <button 
                        className="h-8 p-1 bg-white" 
                        onClick={() => {
                            console.log("RELATIVE CLICKED");
                            setAfterSelect(() => ((relativePart) => (updatePart(selectedPart.id, {...selectedPart, relativeTo: relativePart.id}))));
                        }}
                    >
                        {selectedPart?.relativeTo ? `${selectedPart?.type}-${selectedPart?.id}` : "Select"}
                    </button>
                </div>
            </div> : null}
        </div>
    )
}

export default ButtonLayout;