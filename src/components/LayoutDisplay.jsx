import { Container, Stage } from '@pixi/react';
import React, { createRef, useCallback, useEffect } from 'react';
import { generateUUID } from './utils';
import { useMouseDrag, useMousePosition, usePrevious } from '../hooks/MouseHooks';
import { ADD, SELECT } from './elements/ModeSelect';
import Part from './parts/Part';
import Panel from './parts/Panel';

const LayoutDisplay = ({layout, currentScale, selected, hovered, mode, workspaceDimensions, workspacePosition, workspaceRef, placingPartId, placingPartType, onSelectPart, onSecondarySelectPart, onLayoutChange}) => {
    const componentRef = createRef();
    const [mouseX, mouseY] = useMousePosition(workspaceRef);
    const [deltaX, deltaY, isDragging] = useMouseDrag(workspaceRef);
    const previousIsDragging = usePrevious(isDragging);

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
                position: [(evt.offsetX - workspacePosition[0])/currentScale, (evt.offsetY - workspacePosition[1])/currentScale],
                origin: [0, 0]
            }
        );
        const updatedLayout = {...layout, parts: partsCopy};
        onLayoutChange(updatedLayout);
    }, [layout, onLayoutChange, mode, currentScale, placingPartId, placingPartType, workspacePosition]);
    
    useEffect(() => {
        const ele = workspaceRef.current;
        
        ele.addEventListener('click', addPart);
        return () => {
            ele.removeEventListener('click', addPart);
        }
    }, [addPart, workspaceRef]);

    useEffect(() => {
        if (previousIsDragging === isDragging) {
            return () => {};
        }

        if (!isDragging && selected && mode === SELECT) {
            const updatedParts = [...layout.parts];
            const index = updatedParts.findIndex(({id}) => id === selected);

            const updatedPart = updatedParts[index];
            updatedParts[index] = {...updatedPart, position: [updatedPart.position[0] - deltaX, updatedPart.position[1] - deltaY]};
            const updatedLayout = {...layout, parts: updatedParts};

            onLayoutChange(updatedLayout);
        }
    }, [selected, layout, onLayoutChange, isDragging, previousIsDragging, deltaX, deltaY, mode]);
    
    let component;
    switch (mode) {
        case ADD:
            component = (
                <Part 
                    scale={currentScale} 
                    part={{
                        partId: placingPartId,
                        type: placingPartType,
                        position: [(mouseX - workspacePosition[0])/currentScale, (mouseY - workspacePosition[1])/currentScale], 
                        origin: [0, 0]
                    }} 
                    parent={{
                        parts: layout.parts,
                        panelDimensions: workspaceDimensions
                    }} 
                    onClick={() => {}}
                />
            );
            break;
        default:
            break;
    }

    return (
        <div ref={workspaceRef} className='flex-grow flex-shrink h-0 w-full'>
            <Stage 
                width={workspaceDimensions[0]} 
                height={workspaceDimensions[1]} 
                renderOnComponentChange={false} 
                options={{ background: 0x1099bb }}
            >
                <Container 
                    ref={componentRef}
                    x={workspacePosition[0]} 
                    y={workspacePosition[1]}
                    sortChildren={true}
                >
                    <Panel 
                        scale={currentScale}
                        layout={layout}
                        fill="#000000" 
                    />
                    {component}
                    {layout?.parts?.map((part, index) => 
                        <Part 
                            key={`part-${index}`}
                            selectedPartId={selected}
                            hoveredPartId={hovered}
                            scale={currentScale} 
                            part={{...part,
                                position: selected === part.id && isDragging && mode === SELECT ? [part.position[0] - deltaX, part.position[1] - deltaY] : part.position
                            }} 
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

export default LayoutDisplay;