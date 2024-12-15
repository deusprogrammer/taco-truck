import React, { useState } from 'react';
import ModeSelect, { ADD, SELECT } from './elements/ModeSelect';
import PartMenu from './menus/PartMenu';
import ComponentMenu from './menus/ComponentMenu';
import LayoutDisplay from './LayoutDisplay';
import PartDetailsMenu from './menus/PartDetailsMenu';
import SaveModal from './menus/SaveModal';
import ImportModal from './menus/ImportModal';
import { generateUUID, normalizePartPositionsToZero } from './utils';

const PartDesigner = ({layout, onLayoutChange}) => {
    const [currentScale, setCurrentScale] = useState(5.0);

    const [mode, setMode] = useState(SELECT);
    const [placingPartId, setPlacingPartId] = useState("SANWA-24mm");
    const [placingPartType, setPlacingPartType] = useState("button");
    const [afterSelect, setAfterSelect] = useState(null);

    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);

    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);

    const saveComponent = () => {
        setSaveModalOpen(true);
    }

    const importCustomPart = () => {
        setImportModalOpen(true);
    }

    const completeSave = (name, type) => {
        if (!localStorage.getItem("taco-truck-data")) {
            localStorage.setItem("taco-truck-data", JSON.stringify(
                {
                    customParts: [],
                    panelDesigns: []
                }
            ));
        }

        // Normalize values to zero
        const layoutCopy = {
            ...layout,
            name,
            parts: type === "customParts" ? normalizePartPositionsToZero([...layout.parts]) : layout.parts
        }

        const data = JSON.parse(localStorage.getItem("taco-truck-data"));
        data[type].push(
            {
                id: generateUUID(),
                name,
                layout: layoutCopy
            }
        );

        localStorage.setItem("taco-truck-data", JSON.stringify(
            data
        ));
    }

    const completeImport = (partIds) => {
        const dataJSON = localStorage.getItem("taco-truck-data");
        const data = JSON.parse(dataJSON);

        const partsToImport = data.customParts.filter(({id}) => partIds.includes(id)).map((part) => (
            {
                type: "custom",
                position: [0, 0],
                origin: [0, 0],
                ...part
            }
        ));

        onLayoutChange({
            ...layout,
            parts: [...layout.parts, ...partsToImport]
        });
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

    const selectedPart = layout?.parts?.find(({id}) => id === selected);

    return (
        <div className="flex flex-col w-full h-screen">
            <SaveModal 
                open={saveModalOpen}
                onSaveComplete={completeSave}
                onClose={() => setSaveModalOpen(false)}
            />
            <ImportModal 
                open={importModalOpen}
                onImportComplete={completeImport}
                onClose={() => setImportModalOpen(false)}
            />

            <ModeSelect 
                currentMode={mode} 
                currentZoom={currentScale}
                onModeChange={setMode} 
                onSave={saveComponent}
                onImport={importCustomPart}
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

export default PartDesigner;