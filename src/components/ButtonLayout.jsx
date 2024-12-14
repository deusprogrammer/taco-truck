import React, { useCallback, useState } from 'react';
import ModeSelect, { ADD, SELECT } from './elements/ModeSelect';
import PartMenu from './menus/PartMenu';
import ComponentMenu from './menus/ComponentMenu';
import LayoutDisplay from './LayoutDisplay';
import PartDetailsMenu from './menus/PartDetailsMenu';

const ButtonLayout = ({layout, onLayoutChange}) => {
    const [currentScale, setCurrentScale] = useState(5.0);

    const [mode, setMode] = useState(SELECT);
    const [placingPartId, setPlacingPartId] = useState("SANWA-24mm");
    const [placingPartType, setPlacingPartType] = useState("button");
    const [afterSelect, setAfterSelect] = useState(null);

    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);

    const saveComponent = () => {

    }

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

    const selectedPart = layout.parts.find(({id}) => id === selected);

    return (
        <div className="flex flex-col w-full h-screen">
            <ModeSelect 
                currentMode={mode} 
                currentZoom={currentScale}
                onModeChange={setMode} 
                onSave={saveComponent} 
                onZoomChange={(zoomChange) => setCurrentScale(currentScale + zoomChange)}
            />
            <PartMenu 
                currentPart={placingPartId} 
                active={mode === ADD} 
                onChange={selectPlacingPart}
            />
            <ComponentMenu 
                layout={layout} 
                onSelect={setSelected} 
                onHover={setHovered} 
                onLayoutChange={onLayoutChange} 
            />

            <LayoutDisplay 
                layout={layout}
                currentScale={currentScale}
                selected={selected}
                hovered={hovered}
                mode={mode}
                placingPartId={placingPartId}
                placingPartType={placingPartType}
                onSelectPart={selectPart}
                onSecondarySelectPart={afterSelect}
                onLayoutChange={onLayoutChange}
            />

            <PartDetailsMenu 
                selectedPart={selectedPart}
                onUpdatePart={updatePart}
                onSetSecondarySelect={setAfterSelect}
            />
        </div>
    )
}

export default ButtonLayout;