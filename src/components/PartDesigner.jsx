import React, { createRef, useCallback, useEffect, useState } from 'react'
import ModeSelect, { ADD, PAN, SELECT } from './elements/ModeSelect'
import PartMenu from './menus/PartMenu'
import ComponentMenu from './menus/ComponentMenu'
import LayoutDisplay from './LayoutDisplay'
import LayoutDisplaySvg from './svg/LayoutDisplaySvg'
import PartDetailsMenu from './menus/PartDetailsMenu'
import SaveModal from './menus/SaveModal'
import ImportModal from './menus/ImportModal'
import { generateUUID, normalizePartPositionsToZero } from './utils'
import {
    useButtonDown,
    useContainerSize,
    useMouseDrag,
    usePrevious,
} from '../hooks/MouseHooks'

const SCALE_RATIO = 10

const PartDesigner = ({ layout, onLayoutChange }) => {
    const [currentScale, setCurrentScale] = useState(2.0)

    const containerRef = createRef()
    const [deltaX, deltaY, isDragging] = useMouseDrag(containerRef)
    const buttons = useButtonDown()
    const previousIsDragging = usePrevious(isDragging)
    const [width, height] = useContainerSize(containerRef)

    const [workspacePosition, setWorkspacePosition] = useState([0, 0])

    const [mode, setMode] = useState(SELECT)
    const [placingPartId, setPlacingPartId] = useState('SANWA-24mm')
    const [placingPartType, setPlacingPartType] = useState('button')
    const [afterSelect, setAfterSelect] = useState(null)

    const [selected, setSelected] = useState(null)
    const [hovered, setHovered] = useState(null)
    const [viewingSVG, setViewingSVG] = useState(false)

    const [saveModalOpen, setSaveModalOpen] = useState(false)
    const [importModalOpen, setImportModalOpen] = useState(false)

    const saveComponent = () => {
        setSaveModalOpen(true)
    }

    const importCustomPart = () => {
        setImportModalOpen(true)
    }

    const onScroll = useCallback(
        ({ deltaX, deltaY }) => {
            if (buttons.includes('Shift')) {
                setCurrentScale(
                    Math.max(1, currentScale - deltaY / SCALE_RATIO)
                )
                return
            }

            setWorkspacePosition([
                workspacePosition[0] - deltaX,
                workspacePosition[1] - deltaY,
            ])
        },
        [workspacePosition, currentScale, buttons]
    )

    const completeSave = (name, type) => {
        if (!localStorage.getItem('taco-truck-data')) {
            localStorage.setItem(
                'taco-truck-data',
                JSON.stringify({
                    customParts: [],
                    panelDesigns: [],
                })
            )
        }

        // Normalize values to zero
        const layoutCopy = {
            ...layout,
            name,
            parts:
                type === 'customParts'
                    ? normalizePartPositionsToZero([...layout.parts])
                    : layout.parts,
        }

        const data = JSON.parse(localStorage.getItem('taco-truck-data'))
        data[type].push({
            id: generateUUID(),
            name,
            layout: layoutCopy,
        })

        localStorage.setItem('taco-truck-data', JSON.stringify(data))
    }

    const completeImport = (partIds) => {
        const dataJSON = localStorage.getItem('taco-truck-data')
        const data = JSON.parse(dataJSON)

        const partsToImport = data.customParts
            .filter(({ id }) => partIds.includes(id))
            .map((part) => ({
                type: 'custom',
                position: [0, 0],
                origin: [0, 0],
                ...part,
            }))

        onLayoutChange({
            ...layout,
            parts: [...layout.parts, ...partsToImport],
        })
    }

    const selectPlacingPart = (partType, partId) => {
        setPlacingPartType(partType)
        setPlacingPartId(partId)
    }

    const selectPart = (selectedPart) => {
        setSelected(selectedPart.id)
    }

    const updatePart = (partId, newPart) => {
        const parts = [...layout.parts]
        const index = parts.findIndex(({ id }) => id === partId)

        parts[index] = newPart
        const updatedLayout = { ...layout, parts }

        onLayoutChange(updatedLayout)
        setAfterSelect(null)
    }

    useEffect(() => {
        if (!containerRef?.current) {
            return () => {}
        }

        const element = containerRef.current
        element.addEventListener('wheel', onScroll)
        return () => {
            element.removeEventListener('wheel', onScroll)
        }
    }, [onScroll, containerRef])

    useEffect(() => {
        if (previousIsDragging === isDragging) {
            return () => {}
        }

        if (!isDragging && mode === PAN) {
            setWorkspacePosition((old) => [old[0] - deltaX, old[1] - deltaY])
        }
    }, [isDragging, previousIsDragging, deltaX, deltaY, mode])

    useEffect(() => {
        setWorkspacePosition([width / 2, height / 2])
    }, [width, height])

    const selectedPart = layout?.parts?.find(({ id }) => id === selected)

    const screenX = isDragging
        ? workspacePosition[0] - deltaX
        : workspacePosition[0]
    const screenY = isDragging
        ? workspacePosition[1] - deltaY
        : workspacePosition[1]

    return (
        <div
            className="flex flex-col w-full h-screen"
            style={{ overscrollBehavior: 'none' }}
        >
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
                onExport={setViewingSVG}
                onZoomChange={(zoomChange) =>
                    setCurrentScale(currentScale + zoomChange)
                }
            />
            <PartMenu
                currentPart={placingPartId}
                active={mode === ADD}
                onChange={selectPlacingPart}
            />
            <ComponentMenu
                layout={layout}
                selectedPartId={selected}
                onSelect={setSelected}
                onHover={setHovered}
                onLayoutChange={onLayoutChange}
            />
            {viewingSVG ? (
                <div className="flex flex-grow flex-shrink h-0 w-full justify-center p-14">
                    <LayoutDisplaySvg layout={layout} />
                </div>
            ) : (
                <LayoutDisplay
                    workspaceRef={containerRef}
                    layout={layout}
                    currentScale={currentScale}
                    selected={selected}
                    hovered={hovered}
                    mode={mode}
                    workspaceDimensions={[width, height]}
                    workspacePosition={[screenX, screenY]}
                    placingPartId={placingPartId}
                    placingPartType={placingPartType}
                    onSelectPart={selectPart}
                    onSecondarySelectPart={afterSelect}
                    onLayoutChange={onLayoutChange}
                />
            )}
            <PartDetailsMenu
                layout={layout}
                selectedPart={selectedPart}
                onUpdatePart={updatePart}
                onSecondarySelectPart={afterSelect}
                onSetSecondarySelect={setAfterSelect}
            />
        </div>
    )
}

export default PartDesigner
