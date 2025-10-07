import { Container, Stage } from '@pixi/react'
import React, {
    createContext,
    createRef,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { useGesture } from '@use-gesture/react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import { calculateSizeOfPart, generateUUID } from './utils'
import { useMousePosition } from '../hooks/MouseHooks'
import { ADD, ART_ADJUST, SELECT } from './elements/Modes'
import Part from './parts/Part'
import Panel from './parts/Panel'
import Grid from './Grid'
import { editLockComponentAtom } from '../atoms/ViewOptions.atom'
import { useAtom } from 'jotai'
import { usePartTable } from '../hooks/PartTableHooks'

export const ButtonStatusContext = createContext()

export const useButtonStatus = (part) => {
    const buttonsPressed = useContext(ButtonStatusContext)

    if (part.type !== 'button') {
        return false
    }

    return buttonsPressed?.find(({ id }) => id === part.id)
}

const timeThreshold = 100

const LayoutDisplay = ({
    layout,
    currentScale,
    screenWidth,
    screenHeight,
    selected,
    hovered,
    mode,
    workspaceDimensions,
    workspacePosition,
    workspaceRef,
    placingPartId,
    placingPartType,
    preview,
    onSelectPart,
    onHoverPart,
    onSecondarySelectPart,
    onLayoutChange,
}) => {
    const { partTable } = usePartTable()
    const componentRef = createRef()

    const websocket = useRef()
    const controllerId = useRef()

    const [editLock] = useAtom(editLockComponentAtom)
    const [artSelected, setArtSelected] = useState(false)

    const [selectedIndex, setSelectedIndex] = useState(-1)

    const [mouseX, mouseY] = useMousePosition(workspaceRef)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStartPartPosition, setDragStartPartPosition] = useState(null)
    const [dragStartPartId, setDragStartPartId] = useState(null)

    const bind = useGesture(
        {
            onDrag: ({
                xy,
                movement: [dx, dy],
                offset: [artworkOffsetX, artworkOffsetY],
                dragging,
                first,
                touches,
                buttons,
                shiftKey,
                elapsedTime,
            }) => {
                setIsDragging(dragging)

                if (editLock || (mode !== SELECT && mode !== ART_ADJUST)) {
                    return
                }

                // Initialize drag state on first drag event
                if (
                    first &&
                    selectedIndex >= 0 &&
                    selectedIndex < layout.parts.length
                ) {
                    const selectedPart = layout.parts[selectedIndex]
                    setDragStartPartPosition([...selectedPart.position])
                    setDragStartPartId(selectedPart.id)
                }

                // Reset drag state when dragging ends
                if (!dragging && dragStartPartPosition) {
                    setDragStartPartPosition(null)
                    setDragStartPartId(null)
                }

                if (
                    mode === ART_ADJUST &&
                    artSelected &&
                    elapsedTime > timeThreshold &&
                    !shiftKey &&
                    (touches === 1 || buttons === 1)
                ) {
                    onLayoutChange({
                        ...layout,
                        artworkOffset: [artworkOffsetX, artworkOffsetY],
                    })
                    return
                }

                if (
                    elapsedTime > timeThreshold &&
                    !shiftKey &&
                    dragging &&
                    (touches === 1 || buttons === 1) &&
                    selectedIndex >= 0 &&
                    selectedIndex < layout.parts.length
                ) {
                    // If dragStartPartPosition is null, initialize it now
                    let currentDragStartPosition = dragStartPartPosition
                    if (!currentDragStartPosition) {
                        const selectedPart = layout.parts[selectedIndex]
                        currentDragStartPosition = [...selectedPart.position]
                        setDragStartPartPosition(currentDragStartPosition)
                        setDragStartPartId(selectedPart.id)
                    }

                    let updatedParts = [...layout.parts]
                    let found = { ...layout.parts[selectedIndex] }

                    if (found && !found?.relativeTo) {
                        // Use movement deltas instead of absolute coordinates
                        const scaledDx = dx / currentScale
                        const scaledDy = dy / currentScale

                        found = {
                            ...found,
                            position: [
                                Math.trunc(
                                    currentDragStartPosition[0] + scaledDx
                                ),
                                Math.trunc(
                                    currentDragStartPosition[1] + scaledDy
                                ),
                            ],
                            // Preserve existing origin and anchor
                            origin: found.origin || [0, 0],
                            anchor: found.anchor || [0.5, 0.5],
                        }

                        updatedParts[selectedIndex] = found
                        onLayoutChange({ ...layout, parts: updatedParts })
                    }
                }
            },
            onPinch: ({ offset: [d], memo }) => {
                if (editLock || mode !== ART_ADJUST) {
                    return
                }

                if (!memo) {
                    memo = layout.artworkZoom
                }

                onLayoutChange({
                    ...layout,
                    artworkZoom: Math.max(0.1, memo * d),
                })
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
                    mouse: true,
                },
            },
        }
    )
    const [buttonsPressed, setButtonsPressed] = useState([])

    const [websocketIp, setWebsocketIp] = useState('localhost:3001')
    const [connected, setConnected] = useState(false)

    const isMoving = useRef(false)

    const connect = () => {
        const ws = new W3CWebSocket(`ws://${websocketIp}`)
        controllerId.current = generateUUID()

        //Register player
        ws.onopen = () => {
            websocket.current = ws
            setConnected(true)
        }

        ws.onmessage = (message) => {}

        ws.onclose = (e) => {}

        ws.onerror = (err) => {}
    }

    const updateRemoteButtons = (buttons) => {
        if (!websocket.current) {
            return
        }

        const message = {
            controllerId: controllerId.current,
            buttons: buttons.map(({ id, mapping }) => ({ id, mapping })),
        }
        websocket.current.send(JSON.stringify(message))
    }

    const addPart = useCallback(
        (evt) => {
            if (mode !== ADD) {
                return
            }

            const name = partTable?.[placingPartType]?.[placingPartId].name
            const defaultAnchor = [0.5, 0.5]

            // Calculate part size for anchor positioning
            const partSize = calculateSizeOfPart(
                {
                    type: placingPartType,
                    partId: placingPartId,
                    anchor: defaultAnchor,
                },
                partTable
            )

            // Calculate the adjustment that calculateRelativePosition will make
            const anchorAdjustmentX = defaultAnchor[0] * partSize[0]
            const anchorAdjustmentY = defaultAnchor[1] * partSize[1]

            // Position the part so that after anchor adjustment, it appears at click location
            const clickWorldX =
                (evt.offsetX - workspacePosition[0]) / currentScale
            const clickWorldY =
                (evt.offsetY - workspacePosition[1]) / currentScale

            const partsCopy = [...layout.parts]
            let newPart = {
                id: generateUUID(),
                name,
                type: placingPartType,
                partId: placingPartId,
                position: [
                    Math.trunc(clickWorldX + anchorAdjustmentX),
                    Math.trunc(clickWorldY + anchorAdjustmentY),
                ],
                origin: [0, 0],
                anchor: defaultAnchor, // Default anchor to center
            }

            // if (placingPartType === 'user') {
            //     newPart = { ...partTable['user'][placingPartId], ...newPart }
            // }

            partsCopy.push(newPart)
            const updatedLayout = { ...layout, parts: partsCopy }
            onLayoutChange(updatedLayout)
        },
        [
            layout,
            onLayoutChange,
            mode,
            currentScale,
            placingPartId,
            placingPartType,
            workspacePosition,
            partTable,
        ]
    )

    const handlePointerDown = useCallback((event) => {
        isMoving.current = false
    }, [])

    const handlePointerMove = useCallback((event) => {
        isMoving.current = true
    }, [])

    const handlePointerUp = useCallback(
        (event) => {
            if (!isMoving.current || event.pointerType === 'mouse') {
                addPart(event)
            }
        },
        [addPart]
    )

    useEffect(() => {
        const ele = workspaceRef.current

        ele.addEventListener('pointerdown', handlePointerDown)
        ele.addEventListener('pointermove', handlePointerMove)
        ele.addEventListener('pointerup', handlePointerUp)
        return () => {
            ele.removeEventListener('pointerdown', handlePointerDown)
            ele.removeEventListener('pointermove', handlePointerMove)
            ele.removeEventListener('pointerup', handlePointerUp)
        }
    }, [
        addPart,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        workspaceRef,
    ])

    useEffect(() => {
        const index = layout.parts?.findIndex(({ id }) => id === selected)
        setSelectedIndex(index)

        // Reset drag state if we're switching to a different part
        if (selected !== dragStartPartId) {
            setDragStartPartPosition(null)
            setDragStartPartId(null)
        }
    }, [selected, layout.parts, setSelectedIndex, dragStartPartId])

    useEffect(() => {
        if (!isDragging) {
            setButtonsPressed([])
        }
    }, [isDragging])

    let component
    switch (mode) {
        case ADD:
            // For preview positioning, we need to account for how Part component
            // will adjust the position based on anchor
            const defaultAnchor = [0.5, 0.5]
            const partSize = calculateSizeOfPart(
                {
                    type: placingPartType,
                    partId: placingPartId,
                    anchor: defaultAnchor,
                },
                partTable
            )

            // Calculate the adjustment that calculateRelativePosition will make
            const anchorAdjustmentX = defaultAnchor[0] * partSize[0]
            const anchorAdjustmentY = defaultAnchor[1] * partSize[1]

            // Position the part so that after anchor adjustment, it appears at cursor
            const mouseWorldX = (mouseX - workspacePosition[0]) / currentScale
            const mouseWorldY = (mouseY - workspacePosition[1]) / currentScale

            component = (
                <Part
                    scale={currentScale}
                    part={{
                        partId: placingPartId,
                        type: placingPartType,
                        position: [
                            mouseWorldX + anchorAdjustmentX,
                            mouseWorldY + anchorAdjustmentY,
                        ],
                        origin: [0, 0],
                        anchor: [0.5, 0.5],
                    }}
                    parent={{
                        parts: layout.parts,
                        panelDimensions: workspaceDimensions,
                    }}
                    onClick={() => {}}
                />
            )
            break
        default:
            break
    }

    return (
        <>
            {preview ? (
                <div className="absolute right-0 top-0">
                    <input
                        className="h-8 disabled:bg-gray-600"
                        value={websocketIp}
                        disabled={connected}
                        onChange={({ target: { value } }) =>
                            setWebsocketIp(value)
                        }
                    />
                    <button
                        className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1 disabled:bg-gray-600`}
                        onClick={connect}
                        disabled={connected}
                    >
                        Connect
                    </button>
                </div>
            ) : null}
            <Stage
                width={screenWidth}
                height={screenHeight}
                renderOnComponentChange={true}
                options={{ background: 0x1099bb }}
                {...bind()}
            >
                <Container
                    ref={componentRef}
                    x={workspacePosition[0]}
                    y={workspacePosition[1]}
                    sortChildren={true}
                >
                    <Grid
                        scale={currentScale}
                        screenWidth={screenWidth}
                        screenHeight={screenHeight}
                        workspacePosition={workspacePosition}
                    />
                    <Panel
                        scale={currentScale}
                        layout={layout}
                        fill="#000000"
                        onClick={(state) => {
                            if (state === 'DOWN') {
                                setArtSelected(true)
                            } else {
                                setArtSelected(false)
                            }
                        }}
                    />
                    {component}
                    <ButtonStatusContext.Provider value={buttonsPressed}>
                        {layout?.parts?.map((part, index) => (
                            <Part
                                key={`part-${part.id || index}`}
                                selectedPartId={selected}
                                hoveredPartId={hovered}
                                scale={currentScale}
                                part={part}
                                index={index}
                                parent={layout}
                                onHoverPart={onHoverPart}
                                onClick={onSecondarySelectPart || onSelectPart}
                                onClickPart={(part, action) => {
                                    if (
                                        part.type !== 'button' ||
                                        mode === ART_ADJUST
                                    ) {
                                        return
                                    }

                                    let old = [...buttonsPressed]
                                    if (action === 'DOWN') {
                                        if (
                                            !old.find(
                                                ({ id }) => id === part.id
                                            )
                                        ) {
                                            old = [...buttonsPressed, part]
                                        }
                                    } else if (action === 'UP') {
                                        old = [...buttonsPressed].filter(
                                            ({ id }) => id !== part.id
                                        )
                                    }
                                    setButtonsPressed(old)
                                    updateRemoteButtons(old)
                                }}
                            />
                        ))}
                    </ButtonStatusContext.Provider>
                </Container>
            </Stage>
        </>
    )
}

export default LayoutDisplay
