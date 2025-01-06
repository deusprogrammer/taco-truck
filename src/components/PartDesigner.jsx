import React, { createRef, useCallback, useEffect, useState } from 'react'
import { useGesture } from '@use-gesture/react'
import { ADD, EXPORT, SELECT } from './elements/Modes'
import ComponentMenu from './menus/ComponentMenu'
import LayoutDisplay from './LayoutDisplay'
import ModalContainer, {
    closeModal,
    ModalButton,
    openModal,
} from './modals/ModalContainer'
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
import { useContainerSize, useRealScaleRatio } from '../hooks/MouseHooks'
import { useNavigate } from 'react-router'
import { getDoc } from 'firebase/firestore'
import OptionsModal from './menus/OptionsModal'
import {
    buttonOpacityAtom,
    editLockComponentAtom,
    previewAtom,
    screenSizeAtom,
    scrollLockComponentAtom,
    selectedAtom,
    workspacePositionAtom,
    zoomAtom,
    zoomLockComponentAtom,
} from '../atoms/ViewOptions.atom'
import { useAtom } from 'jotai'
import {
    LockToggleButton,
    ModeButton,
    NewButton,
    OpenButton,
    RealSizeZoomButton,
    ToggleButton,
    ZoomButton,
} from './elements/Buttons'
import AboutModal from './menus/About'
import PartMenu from './menus/PartMenu'
import { useKeyShortcuts } from '../hooks/AtomHooks'
import ExportModal from './menus/ExportModal'

const SCALE_RATIO = 1000

const PartDesigner = ({
    layout,
    preview: previewOverride,
    isNew,
    onLayoutChange,
}) => {
    const containerRef = createRef()
    useKeyShortcuts({ layout, containerRef })

    const navigate = useNavigate()
    const realSizeRatio = useRealScaleRatio()

    const [width, height] = useContainerSize(containerRef)
    const [[screenWidth, screenHeight], setScreenSize] = useAtom(screenSizeAtom)
    // const [[screenWidth, screenHeight], setScreenSize] = useState([
    //     window.innerWidth,
    //     window.innerHeight,
    // ])
    const [initialLoad, setInitialLoad] = useState(true)

    const [workspacePosition, setWorkspacePosition] = useAtom(
        workspacePositionAtom
    )
    const [zoom, setZoom] = useAtom(zoomAtom)
    const [mode, setMode] = useAtom(selectedAtom)
    const [editLock, setEditLock] = useAtom(editLockComponentAtom)
    const [scrollLock, setScrollLock] = useAtom(scrollLockComponentAtom)
    const [zoomLock, setZoomLock] = useAtom(zoomLockComponentAtom)
    const [preview, setPreview] = useAtom(previewAtom)
    const [buttonOpacity, setButtonOpacity] = useAtom(buttonOpacityAtom)

    const [placingPartId, setPlacingPartId] = useState('SANWA-24mm')
    const [placingPartType, setPlacingPartType] = useState('button')
    const [afterSelect, setAfterSelect] = useState(null)

    const [selected, setSelected] = useState(null)
    const [hovered, setHovered] = useState(null)

    const bind = useGesture(
        {
            onDrag: ({
                delta: [x, y],
                dragging,
                touches,
                buttons,
                shiftKey,
            }) => {
                if (scrollLock) {
                    return
                }

                if (
                    dragging &&
                    (touches === 2 || (buttons === 1 && shiftKey))
                ) {
                    setWorkspacePosition(([oldX, oldY]) => [oldX + x, oldY + y])
                }
            },
            onPinch: ({ offset: [d], memo }) => {
                if (zoomLock || preview) {
                    return
                }

                if (!memo) {
                    memo = zoom
                }

                setZoom(Math.max(1, memo * d))
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

    const onScroll = useCallback(
        ({ deltaX, deltaY }) => {
            if (zoomLock) {
                return
            }

            setZoom(Math.max(1, zoom - (deltaY || deltaX) / SCALE_RATIO))
        },
        [zoom, zoomLock, setZoom]
    )

    const completeSave = (name, type, isLocal) => {
        if (isLocal) {
            saveLocal(name, type)
        } else {
            saveCloud(name, type)
        }
    }

    const [partsWidth, partsHeight] = calculateSizeOfPart({
        type: 'custom',
        layout: layout,
    })

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
        // if (mode !== SELECT) {
        //     return
        // }
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
            openModal('options')
            return
        }

        setZoom(realSizeRatio)
    }

    const centerWorkPiece = useCallback(() => {
        setScreenSize([window.innerWidth, window.innerHeight])

        let contextWidth = partsWidth
        let contextHeight = partsHeight
        if (layout.panelDimensions[0]) {
            contextWidth = layout.panelDimensions[0]
        }

        if (layout.panelDimensions[1]) {
            contextHeight = layout.panelDimensions[1]
        }

        console.log(`${contextWidth} x ${contextHeight}`)

        if (width > 0 && height > 0) {
            setWorkspacePosition([
                width / 2 - (contextWidth / 2) * zoom,
                height / 2 - (contextHeight / 2) * zoom,
            ])
        }
    }, [
        height,
        layout.panelDimensions,
        partsHeight,
        partsWidth,
        setWorkspacePosition,
        width,
        zoom,
    ])

    useEffect(() => {
        if (!preview) {
            return () => {}
        }

        closeModal()
        setMode('NONE')
        if (!realSizeRatio) {
            openModal('options')
            return
        }

        setZoom(realSizeRatio)
    }, [realSizeRatio, preview, previewOverride, setZoom, setMode])

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
        if (!initialLoad) {
            return () => {}
        }

        if (isNew || (partsWidth > 0 && partsHeight > 0)) {
            setInitialLoad(false)
        }

        centerWorkPiece()
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
        centerWorkPiece,
        setWorkspacePosition,
    ])

    useEffect(() => {
        window.addEventListener('resize', centerWorkPiece)
        window.addEventListener('orientationchange', centerWorkPiece)
        return () => {
            window.removeEventListener('resize', centerWorkPiece)
            window.removeEventListener('orientationchange', centerWorkPiece)
        }
    }, [centerWorkPiece])

    const selectedPart = layout?.parts?.find(({ id }) => id === selected)

    const screenX = workspacePosition[0]
    const screenY = workspacePosition[1]

    return (
        <div className="bg-[#1099bb]">
            <ModalContainer
                modalMapping={{
                    save: (
                        <SaveModal
                            name={layout.name}
                            onSaveComplete={completeSave}
                        />
                    ),
                    import: <ImportModal onImportComplete={completeImport} />,
                    export: <ExportModal layout={layout} />,
                    options: <OptionsModal />,
                    about: <AboutModal />,
                }}
            />
            <header className="absolute left-0 top-0 w-screen p-2 text-center text-xl font-extrabold text-white lg:hidden">
                <div>View Only Mode</div>
                <div>{layout.name}</div>
            </header>

            <footer className="absolute bottom-0 left-0 w-screen p-2 text-center text-xl font-extrabold text-white lg:hidden">
                © 2025 Michael C Main
            </footer>

            {!preview ? (
                <>
                    <div
                        id="menu-top"
                        className="absolute left-0 top-0 hidden w-screen flex-col lg:flex"
                    >
                        <div className="flex w-screen flex-row items-center justify-around gap-10 p-[10px]">
                            <NewButton />
                            <OpenButton />
                            <ModeButton
                                mode="Select"
                                currentMode={mode}
                                onClick={setMode}
                            />
                            <ModeButton
                                mode="Add"
                                currentMode={mode}
                                onClick={setMode}
                            />
                            <ModalButton modalKey="import">Import</ModalButton>
                            <ModalButton modalKey="export">Export</ModalButton>
                            <ModalButton modalKey="save">Save</ModalButton>
                            <ModalButton modalKey="options">
                                Options
                            </ModalButton>
                            <ModalButton modalKey="about">About</ModalButton>
                        </div>
                        <PartMenu
                            active={mode === ADD}
                            currentPart={placingPartId}
                            onChange={selectPlacingPart}
                        />
                    </div>
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
                    <div
                        id="menu-bottom"
                        className="absolute bottom-0 left-0 hidden h-[80px] w-screen flex-row items-center justify-center gap-9 lg:flex"
                    >
                        <ZoomButton
                            onZoomChange={(adj) => setZoom(zoom + adj)}
                            currentZoom={zoom}
                        />
                        <RealSizeZoomButton
                            zoomValue={zoom}
                            onClick={setRealSizeZoom}
                        />
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
                        <ToggleButton
                            toggle={buttonOpacity === 0.5}
                            onClick={() =>
                                buttonOpacity === 0.5
                                    ? setButtonOpacity(1)
                                    : setButtonOpacity(0.5)
                            }
                        >
                            Transparent
                        </ToggleButton>
                    </div>
                </>
            ) : (
                <>
                    <div className="absolute bottom-0 left-0 flex h-[80px] w-screen flex-row items-center justify-center">
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
                        <span className="font-extrabold">Name:</span>{' '}
                        {layout.name}
                    </div>
                    <div>
                        <span className="font-extrabold">Panel:</span>{' '}
                        {layout.panelDimensions[0]}mm X{' '}
                        {layout.panelDimensions[1]}mm
                    </div>
                </div>
            ) : null}

            {mode === EXPORT ? (
                <div className="flex justify-center p-14">
                    <LayoutDisplaySvg layout={layout} scale={2} />
                </div>
            ) : (
                <div ref={containerRef} {...bind()}>
                    <LayoutDisplay
                        workspaceRef={containerRef}
                        layout={layout}
                        currentScale={zoom}
                        screenWidth={screenWidth}
                        screenHeight={screenHeight}
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
                        onClickPart={() => {}}
                        onLayoutChange={onLayoutChange}
                    />
                </div>
            )}
        </div>
    )
}

export default PartDesigner
