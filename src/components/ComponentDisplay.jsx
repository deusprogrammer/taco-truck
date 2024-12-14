import { Container, Stage } from '@pixi/react';
import React, { createRef, useCallback, useEffect, useState } from 'react';
import { generateUUID } from './utils';
import { useContainerSize, useMouseDrag, useMousePosition } from '../hooks/MouseHooks';
import { ADD, PAN } from './elements/ModeSelect';
import Part from './parts/Part';

const ComponentDisplay = ({layout, currentScale, selected, hovered, mode, placingPartId, placingPartType, onSelectPart, onSecondarySelectPart, onLayoutChange}) => {
    const componentRef = createRef();
    const containerRef = createRef();

    const [width, height] = useContainerSize(containerRef);
    const [mouseX, mouseY] = useMousePosition(containerRef);
    const [deltaX, deltaY, dragEnded] = useMouseDrag(containerRef);

    const [workPiecePosition, setWorkPiecePosition] = useState([width / 2, height / 2]);

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
                position: [(evt.offsetX - workPiecePosition[0])/currentScale, (evt.offsetY - workPiecePosition[1])/currentScale],
                origin: [0, 0]
            }
        );
        const updatedLayout = {...layout, parts: partsCopy};
        onLayoutChange(updatedLayout);
    }, [layout, onLayoutChange, mode, currentScale, placingPartId, placingPartType, workPiecePosition]);
    
    useEffect(() => {
        const ele = containerRef.current;
        
        ele.addEventListener('click', addPart);
        return () => {
            ele.removeEventListener('click', addPart);
        }
    }, [addPart, containerRef]);

    useEffect(() => {
        if (dragEnded && mode === PAN) {
            setWorkPiecePosition(
                (old) => [
                    old[0] - deltaX, 
                    old[1] - deltaY
                ]
            );
        }
    }, [dragEnded, deltaX, deltaY, mode]);
    
    let component;
    switch (mode) {
        case ADD:
            component = (
                <Part 
                    scale={currentScale} 
                    part={{
                        partId: placingPartId,
                        type: placingPartType,
                        position: [(mouseX - workPiecePosition[0])/currentScale, (mouseY - workPiecePosition[1])/currentScale], 
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

    return (
        <div ref={containerRef} className='flex-grow flex-shrink-0 w-full'>
            <Stage 
                width={width} 
                height={height} 
                renderOnComponentChange={false} 
                options={{ background: 0x1099bb }}
            >
                <Container 
                    ref={componentRef}
                    x={!dragEnded && mode === PAN ? workPiecePosition[0] - deltaX : workPiecePosition[0]} 
                    y={!dragEnded && mode === PAN ? workPiecePosition[1] - deltaY : workPiecePosition[1]} 
                    anchor={0.5} 
                    sortChildren={true}
                >
                    {component}
                    {layout.parts.map((part, index) => 
                        <Part 
                            key={`button-${index}`}
                            selectedPartId={selected}
                            hoveredPartId={hovered}
                            scale={currentScale} 
                            part={part} 
                            index={index} 
                            parent={layout}
                            onClick={onSecondarySelectPart || onSelectPart} />
                        )
                    }
                </Container>
            </Stage>
        </div>
    );
}

export default ComponentDisplay;