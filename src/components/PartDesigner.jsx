import React, { createRef, useCallback, useEffect, useState } from 'react'
import ModeSelect, { ADD, SELECT } from './elements/ModeSelect'
import PartMenu from './menus/PartMenu'
import ComponentMenu from './menus/ComponentMenu'
import LayoutDisplay from './LayoutDisplay'
import LayoutDisplaySvg from './svg/LayoutDisplaySvg'
import PartDetailsMenu from './menus/PartDetailsMenu'
import SaveModal from './menus/SaveModal'
import ImportModal from './menus/ImportModal'
import {
    calculateSizeOfPart,
    generateUUID,
    normalizePartPositionsToZero,
    storeMedia,
} from './utils'
import { addDoc, collection, db, doc } from '../firebase.config'
import {
    useButtonDown,
    useContainerSize,
    useMouseDrag,
    usePrevious,
    useRealScaleRatio,
} from '../hooks/MouseHooks'
import { useNavigate } from 'react-router'
import { getDoc } from 'firebase/firestore'
import OptionsModal from './menus/OptionsModal'

const SCALE_RATIO = 10

const PartDesigner = ({ layout, preview, onLayoutChange }) => {
    const [partsWidth, partsHeight] = calculateSizeOfPart({
        type: 'custom',
        layout: layout,
    })

    const navigate = useNavigate()
    const realSizeRatio = useRealScaleRatio()
    const [currentScale, setCurrentScale] = useState(2.0)

    const containerRef = createRef()
    const [deltaX, deltaY, isDragging, reset] = useMouseDrag(
        containerRef,
        'middle'
    )
    const buttons = useButtonDown()
    const previousIsDragging = usePrevious(isDragging)
    const [width, height] = useContainerSize(containerRef)

    const [workspacePosition, setWorkspacePosition] = useState([0, 0])

    const [mode, setMode] = useState(SELECT)
    const [placingPartId, setPlacingPartId] = useState('SANWA-24mm')
    const [placingPartType, setPlacingPartType] = useState('button')
    const [afterSelect, setAfterSelect] = useState(null)

    const [lastClicked, setLastClicked] = useState(null)
    const [selected, setSelected] = useState(null)
    const [hovered, setHovered] = useState(null)
    const [viewingSVG, setViewingSVG] = useState(false)

    const [saveModalOpen, setSaveModalOpen] = useState(false)
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [optionsModalOpen, setOptionsModalOpen] = useState(false)

    const saveComponent = () => {
        setSaveModalOpen(true)
    }

    const importCustomPart = () => {
        setImportModalOpen(true)
    }

    const onScroll = useCallback(
        ({ deltaX, deltaY }) => {
            if (preview) {
                return
            }

            if (buttons.includes('Shift')) {
                setCurrentScale(
                    Math.max(1, currentScale - deltaY / SCALE_RATIO)
                )
                return
            }

            setWorkspacePosition((old) => [old[0] - deltaX, old[1] - deltaY])
        },
        [currentScale, buttons, preview]
    )

    const completeSave = (name, type, isLocal) => {
        if (isLocal) {
            saveLocal(name, type)
        } else {
            saveCloud(name, type)
        }
    }

    const saveCloud = async (name, type) => {
        try {
            // Normalize values to zero
            const layoutCopy = {
                ...layout,
                name,
                parts:
                    type === 'customParts'
                        ? normalizePartPositionsToZero([...layout.parts])
                        : layout.parts,
            }

            if (layout.artwork) {
                if (!layout.artwork.startsWith('https')) {
                    let { _id: id } = await storeMedia(
                        layout.artwork,
                        layout.name + '_ART'
                    )
                    layoutCopy.artwork = `https://deusprogrammer.com/api/img-svc/media/${id}/file`
                }
            }

            const data = {
                name,
                layout: layoutCopy,
            }

            console.log('DATA: ' + JSON.stringify(data, null, 5))

            let docRef
            if (type === 'customParts') {
                docRef = await addDoc(collection(db, 'components'), data)
            } else if (type === 'panelDesigns') {
                docRef = await addDoc(collection(db, 'projects'), data)
            }

            console.log('Document successfully written!')
            navigate(
                `/designer/${type === 'customParts' ? 'parts' : 'projects'}/${docRef.id}`
            )
        } catch (e) {
            console.error('Error adding document: ', e)
        }
    }

    const saveLocal = (name, type) => {
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
        const newEntry = {
            id: generateUUID(),
            name,
            layout: layoutCopy,
        }
        data[type].push(newEntry)

        localStorage.setItem('taco-truck-data', JSON.stringify(data))
        navigate(
            `/designer/${type === 'customParts' ? 'parts' : 'projects'}/${newEntry.id}?isLocal=true`
        )
    }

    const completeImport = async (partIds) => {
        const dataJSON = localStorage.getItem('taco-truck-data')
        const localData = JSON.parse(dataJSON)

        const partsToImport = await Promise.all(
            partIds.map(async (partId) => {
                if (partId.startsWith('local-')) {
                    const localPartId = partId.replace('local-', '')
                    const part = localData.customParts.find(
                        ({ id }) => id === localPartId
                    )
                    return {
                        type: 'custom',
                        id: generateUUID(),
                        position: [0, 0],
                        origin: [0, 0],
                        ...part,
                    }
                } else if (partId.startsWith('cloud-')) {
                    const cloudPartId = partId.replace('cloud-', '')
                    const docRef = doc(db, 'components', cloudPartId)
                    const docSnap = await getDoc(docRef)
                    if (docSnap.exists()) {
                        const part = docSnap.data()
                        return {
                            type: 'custom',
                            id: generateUUID(),
                            position: [0, 0],
                            origin: [0, 0],
                            ...part,
                        }
                    }
                }
                return null
            })
        )

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
        if (mode !== SELECT) {
            return
        }
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
        if (!preview) {
            return () => {}
        }

        setOptionsModalOpen(false)
        setMode('NONE')
        if (!realSizeRatio) {
            setOptionsModalOpen(true)
            return
        }

        setCurrentScale(realSizeRatio)
    }, [realSizeRatio, preview, setOptionsModalOpen])

    useEffect(() => {
        if (!containerRef?.current) {
            return () => {}
        }

        const element = containerRef.current
        element.addEventListener('wheel', onScroll)
        return () => {
            element.removeEventListener('wheel', onScroll)
        }
    }, [onScroll, containerRef, preview])

    useEffect(() => {
        if (previousIsDragging === isDragging || preview) {
            return () => {}
        }

        if (!isDragging) {
            setWorkspacePosition((old) => [old[0] - deltaX, old[1] - deltaY])
            reset()
        }
    }, [isDragging, previousIsDragging, deltaX, deltaY, reset, preview])

    useEffect(() => {
        if (preview) {
            setWorkspacePosition([
                width / 2 -
                    (Math.min(
                        partsWidth,
                        layout.panelDimensions[0] || partsWidth
                    ) /
                        2) *
                        currentScale,
                height / 2 -
                    (Math.min(
                        partsHeight,
                        layout.panelDimensions[1] || partsHeight
                    ) /
                        2) *
                        currentScale,
            ])
        }
    }, [width, height, currentScale, partsWidth, partsHeight, layout, preview])

    const selectedPart = layout?.parts?.find(({ id }) => id === selected)

    const screenX =
        isDragging && !preview
            ? workspacePosition[0] - deltaX
            : workspacePosition[0]
    const screenY =
        isDragging && !preview
            ? workspacePosition[1] - deltaY
            : workspacePosition[1]

    return (
        <div
            className="flex h-screen w-full flex-col"
            style={{ overscrollBehavior: 'none', userSelect: 'none' }}
        >
            <SaveModal
                open={saveModalOpen}
                name={layout.name}
                onSaveComplete={completeSave}
                onClose={() => setSaveModalOpen(false)}
            />
            <ImportModal
                open={importModalOpen}
                onImportComplete={completeImport}
                onClose={() => setImportModalOpen(false)}
            />
            <OptionsModal
                open={optionsModalOpen}
                onClose={() => setOptionsModalOpen(false)}
            />

            {!preview ? (
                <>
                    <ModeSelect
                        currentMode={mode}
                        currentZoom={currentScale}
                        onModeChange={setMode}
                        onSave={saveComponent}
                        onImport={importCustomPart}
                        onOptions={setOptionsModalOpen}
                        onExport={setViewingSVG}
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
                    <PartDetailsMenu
                        layout={layout}
                        selectedPart={selectedPart}
                        onUpdatePart={updatePart}
                        onSecondarySelectPart={afterSelect}
                        onSetSecondarySelect={setAfterSelect}
                    />
                </>
            ) : null}

            {preview ? (
                <div className="absolute left-0 top-0 text-white">
                    <div>
                        Scale: {Math.trunc(currentScale * 100)}% (
                        {realSizeRatio} pixels/mm )
                    </div>
                    <div>Name: {layout.name}</div>
                    <div>
                        Panel: {layout.panelDimensions[0]}mm X{' '}
                        {layout.panelDimensions[1]}mm
                    </div>
                    <div>
                        Last Clicked: {lastClicked?.name || 'None'}[
                        {lastClicked?.id}]
                    </div>
                </div>
            ) : null}

            {viewingSVG ? (
                <div className="flex h-0 w-full flex-shrink flex-grow justify-center p-14">
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
                    preview={preview}
                    onSelectPart={selectPart}
                    onSecondarySelectPart={afterSelect}
                    onClickPart={setLastClicked}
                    onLayoutChange={onLayoutChange}
                />
            )}
        </div>
    )
}

export default PartDesigner
