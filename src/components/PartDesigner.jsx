import React, { createRef, useCallback, useEffect, useState } from 'react'
import { useGesture } from '@use-gesture/react'
import ModeSelect, { ADD, EXPORT, SELECT } from './elements/ModeSelect'
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
    usePrevious,
    useRealScaleRatio,
} from '../hooks/MouseHooks'
import { useNavigate } from 'react-router'
import { getDoc } from 'firebase/firestore'
import OptionsModal from './menus/OptionsModal'
import {
    editLockComponentAtom,
    previewAtom,
    scrollLockComponentAtom,
    workspacePositionAtom,
    zoomAtom,
    zoomLockComponentAtom,
} from '../atoms/ViewOptions.atom'
import { useAtom } from 'jotai'
import {
    LockToggleButton,
    RealSizeZoomButton,
    ZoomButton,
} from './elements/Buttons'

const SCALE_RATIO = 1000

const PartDesigner = ({
    layout,
    preview: previewOverride,
    isNew,
    onLayoutChange,
}) => {
    const [partsWidth, partsHeight] = calculateSizeOfPart({
        type: 'custom',
        layout: layout,
    })

    const navigate = useNavigate()
    const realSizeRatio = useRealScaleRatio()

    const containerRef = createRef()
    const [isDragging, setIsDragging] = useState(false)
    const [[deltaX, deltaY], setDelta] = useState([0, 0])
    const buttonsDown = useButtonDown()
    const previousIsDragging = usePrevious(isDragging)

    const [width, height] = useContainerSize(containerRef)
    const [initialLoad, setInitialLoad] = useState(true)

    const [workspacePosition, setWorkspacePosition] = useAtom(
        workspacePositionAtom
    )
    const [zoom, setZoom] = useAtom(zoomAtom)

    const [mode, setMode] = useState(SELECT)

    const [editLock, setEditLock] = useAtom(editLockComponentAtom)
    const [scrollLock, setScrollLock] = useAtom(scrollLockComponentAtom)
    const [zoomLock, setZoomLock] = useAtom(zoomLockComponentAtom)
    const [preview, setPreview] = useAtom(previewAtom)

    const [placingPartId, setPlacingPartId] = useState('SANWA-24mm')
    const [placingPartType, setPlacingPartType] = useState('button')
    const [afterSelect, setAfterSelect] = useState(null)

    const [lastClicked, setLastClicked] = useState(null)
    const [selected, setSelected] = useState(null)
    const [hovered, setHovered] = useState(null)

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
            if (zoomLock) {
                return
            }

            setZoom(Math.max(1, zoom - (deltaY || deltaX) / SCALE_RATIO))
        },
        [zoom, zoomLock, setZoom]
    )

    const bind = useGesture(
        {
            onDrag: ({ offset: [x, y], dragging, touches, buttons }) => {
                if (scrollLock) {
                    return
                }

                if (
                    touches === 2 ||
                    (buttons === 1 && buttonsDown.includes('Shift'))
                ) {
                    setDelta([-x, -y])
                    setIsDragging(dragging)
                }
            },
            onPinch: ({ offset: [d], memo }) => {
                if (zoomLock || preview) {
                    return
                }

                if (!memo) {
                    memo = zoom // Store the initial zoom value
                }

                setZoom(Math.max(1, memo * d)) // Adjust the zoom incrementally
                return memo
            },
        },
        {
            drag: {
                pointer: {
                    touch: true,
                    mouse: true,
                },
            },
            pinch: {
                pointer: {
                    touch: true,
                },
            },
        }
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
        setSelected(selectedPart?.id)
    }

    const hoverPart = (hoveredPart) => {
        if (mode !== SELECT) {
            return
        }
        setHovered(hoveredPart?.id)
    }

    const updatePart = (partId, newPart) => {
        const parts = [...layout.parts]
        const index = parts.findIndex(({ id }) => id === partId)

        parts[index] = newPart
        const updatedLayout = { ...layout, parts }

        onLayoutChange(updatedLayout)
        setAfterSelect(null)
    }

    const setRealSizeZoom = () => {
        if (!realSizeRatio) {
            setOptionsModalOpen(true)
            return
        }

        setZoom(realSizeRatio)
    }

    const onKeyDown = useCallback(
        (evt) => {
            if (evt.key === 'Escape') {
                if (mode === SELECT) {
                    setSelected(null)
                } else if (mode === ADD) {
                    setMode(SELECT)
                }
            } else if (evt.key === 'p') {
                setPreview(!preview)
            } else if (evt.key === '1') {
                setEditLock(!editLock)
            } else if (evt.key === '2') {
                setScrollLock(!scrollLock)
            } else if (evt.key === '3') {
                setZoomLock(!zoomLock)
            } else if (evt.key === 'r') {
                setZoom(realSizeRatio)
            } else if (evt.key === 'q') {
                !zoomLock && setZoom(Math.max(zoom - 0.2, 0.1))
            } else if (evt.key === 'e') {
                !zoomLock && setZoom(zoom + 0.2)
            } else if (evt.key === 'w') {
                !scrollLock &&
                    setWorkspacePosition([
                        workspacePosition[0],
                        workspacePosition[1] - 8 * zoom,
                    ])
            } else if (evt.key === 's') {
                !scrollLock &&
                    setWorkspacePosition([
                        workspacePosition[0],
                        workspacePosition[1] + 8 * zoom,
                    ])
            } else if (evt.key === 'a') {
                !scrollLock &&
                    setWorkspacePosition([
                        workspacePosition[0] - 8 * zoom,
                        workspacePosition[1],
                    ])
            } else if (evt.key === 'd') {
                !scrollLock &&
                    setWorkspacePosition([
                        workspacePosition[0] + 8 * zoom,
                        workspacePosition[1],
                    ])
            }
        },
        [
            mode,
            realSizeRatio,
            zoomLock,
            scrollLock,
            editLock,
            zoom,
            workspacePosition,
            preview,
            setPreview,
            setWorkspacePosition,
            setZoom,
            setZoomLock,
            setScrollLock,
            setEditLock,
        ]
    )

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [onKeyDown])

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

        setZoom(realSizeRatio)
    }, [realSizeRatio, preview, previewOverride, setOptionsModalOpen, setZoom])

    useEffect(() => {
        setPreview(previewOverride)
    }, [previewOverride, setPreview])

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
        if (previousIsDragging === isDragging || scrollLock) {
            return () => {}
        }

        if (!isDragging) {
            setWorkspacePosition((old) => [old[0] - deltaX, old[1] - deltaY])
        }
    }, [
        isDragging,
        previousIsDragging,
        deltaX,
        deltaY,
        scrollLock,
        setWorkspacePosition,
    ])

    useEffect(() => {
        if (!initialLoad) {
            return () => {}
        }

        if (isNew || (partsWidth > 0 && partsHeight > 0)) {
            setInitialLoad(false)
        }

        if (
            (layout.panelDimensions[0] > 0 && layout.panelDimensions[1] > 0) ||
            layout.parts.length > 0
        ) {
            setWorkspacePosition([
                width / 2 -
                    (Math.min(
                        partsWidth,
                        layout.panelDimensions[0] || partsWidth
                    ) /
                        2) *
                        zoom,
                height / 2 -
                    (Math.min(
                        partsHeight,
                        layout.panelDimensions[1] || partsHeight
                    ) /
                        2) *
                        zoom,
            ])
        }
    }, [
        isNew,
        width,
        height,
        zoom,
        partsWidth,
        partsHeight,
        layout,
        preview,
        initialLoad,
        setWorkspacePosition,
    ])

    const selectedPart = layout?.parts?.find(({ id }) => id === selected)

    const screenX =
        isDragging && !scrollLock
            ? workspacePosition[0] - deltaX
            : workspacePosition[0]
    const screenY =
        isDragging && !scrollLock
            ? workspacePosition[1] - deltaY
            : workspacePosition[1]

    return (
        <div
            className="flex h-screen w-full flex-col bg-[#1099bb]"
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
                        currentPart={placingPartId}
                        onModeChange={setMode}
                        onSave={saveComponent}
                        onImport={importCustomPart}
                        onOptions={setOptionsModalOpen}
                        onChangeAddPart={selectPlacingPart}
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
                    <div className="absolute bottom-0 left-0 flex w-screen flex-row items-center justify-center gap-9">
                        <ZoomButton
                            onZoomChange={(adj) => setZoom(zoom + adj)}
                            currentZoom={zoom}
                        />
                        <RealSizeZoomButton onClick={setRealSizeZoom} />
                        <LockToggleButton
                            locked={editLock}
                            onClick={setEditLock}
                        >
                            Edit
                        </LockToggleButton>
                        <LockToggleButton
                            locked={scrollLock}
                            onClick={setScrollLock}
                        >
                            Scroll
                        </LockToggleButton>
                        <LockToggleButton
                            locked={zoomLock}
                            onClick={setZoomLock}
                        >
                            Zoom
                        </LockToggleButton>
                    </div>
                </>
            ) : (
                <>
                    <div className="absolute bottom-0 left-0 flex w-screen flex-row items-center justify-center">
                        <LockToggleButton
                            locked={scrollLock}
                            onClick={setScrollLock}
                        >
                            Scroll
                        </LockToggleButton>
                    </div>
                </>
            )}

            {preview ? (
                <div className="absolute left-0 top-0 text-white">
                    <div>
                        Scale: {Math.trunc(zoom * 100)}% ({realSizeRatio}{' '}
                        pixels/mm )
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

            {mode === EXPORT ? (
                <div className="flex h-0 w-full flex-shrink flex-grow justify-center p-14">
                    <LayoutDisplaySvg layout={layout} scale={2} />
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="flex h-0 w-full flex-shrink flex-grow justify-center"
                    {...bind()}
                >
                    <LayoutDisplay
                        workspaceRef={containerRef}
                        layout={layout}
                        currentScale={zoom}
                        selected={selected}
                        hovered={hovered}
                        mode={mode}
                        locked={editLock}
                        workspaceDimensions={[width, height]}
                        workspacePosition={[screenX, screenY]}
                        placingPartId={placingPartId}
                        placingPartType={placingPartType}
                        preview={preview}
                        onHoverPart={hoverPart}
                        onSelectPart={selectPart}
                        onSecondarySelectPart={afterSelect}
                        onClickPart={setLastClicked}
                        onLayoutChange={onLayoutChange}
                    />
                </div>
            )}
        </div>
    )
}

export default PartDesigner
