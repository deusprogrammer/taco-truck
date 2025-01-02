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
import { useDrag } from '@use-gesture/react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import { calculateSizeOfPart, generateUUID } from './utils'
import {
    useButtonDown,
    useMousePosition,
    usePrevious,
} from '../hooks/MouseHooks'
import { ADD, SELECT } from './elements/ModeSelect'
import Part from './parts/Part'
import Panel from './parts/Panel'
import { CIRCLE, partTable } from '../data/parts.table'
import { editLockComponentAtom } from '../atoms/ViewOptions.atom'
import { useAtom } from 'jotai'

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
    const componentRef = createRef()
    const [editLock] = useAtom(editLockComponentAtom)
    const websocket = useRef()
    const controllerId = useRef()
    const buttonsDown = useButtonDown()
    const [dragging, setDragging] = useState(null)
    const [latch, setLatch] = useState(null)
    const previouslyDragged = usePrevious(dragging)
    const [mouseX, mouseY] = useMousePosition(workspaceRef)
    const [[dragX, dragY], setMouseXY] = useState([0, 0])
    const [isDragging, setIsDragging] = useState(false)
    const previousIsDragging = usePrevious(isDragging)
    const bind = useDrag(
        ({ xy, dragging, touches, buttons, shiftKey, elapsedTime }) => {
            if (editLock) {
                return
            }

            if (
                elapsedTime > timeThreshold &&
                !shiftKey &&
                dragging &&
                (touches === 1 || buttons === 1 || latch)
            ) {
                setMouseXY(xy)
                setIsDragging(dragging)
                setLatch(true)
            }
        },
        {
            pointer: {
                touch: true,
                mouse: true,
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

            const partsCopy = [...layout.parts]
            partsCopy.push({
                id: generateUUID(),
                name: `${placingPartType}-${placingPartId}`,
                type: placingPartType,
                partId: placingPartId,
                position: [
                    Math.trunc(
                        (evt.offsetX - workspacePosition[0]) / currentScale
                    ),
                    Math.trunc(
                        (evt.offsetY - workspacePosition[1]) / currentScale
                    ),
                ],
                origin: [0, 0],
            })
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

    const renderPart = (part, index) => {
        const modifiedPart = { ...part }

        if (
            !part.relativeTo &&
            dragging === part.id &&
            isDragging &&
            mode === SELECT &&
            !editLock
        ) {
            if (
                !partTable[modifiedPart.type] ||
                partTable[modifiedPart.type][
                    modifiedPart.partId
                ].shape.toUpperCase() !== CIRCLE
            ) {
                modifiedPart.position = [
                    (dragX -
                        workspacePosition[0] -
                        (calculateSizeOfPart(modifiedPart)[0] * currentScale) /
                            2) /
                        currentScale,
                    (dragY -
                        workspacePosition[1] -
                        (calculateSizeOfPart(modifiedPart)[1] * currentScale) /
                            2) /
                        currentScale,
                ]
                modifiedPart.origin = [0, 0]
                modifiedPart.anchor = [0, 0]
            } else {
                modifiedPart.position = [
                    (dragX - workspacePosition[0]) / currentScale,
                    (dragY - workspacePosition[1]) / currentScale,
                ]
            }
        }

        const renderedPart = (
            <Part
                key={`part-${part.id || index}`}
                selectedPartId={selected}
                hoveredPartId={hovered}
                scale={currentScale}
                part={modifiedPart}
                index={index}
                parent={layout}
                onHoverPart={onHoverPart}
                onClick={onSecondarySelectPart || onSelectPart}
                onClickPart={(part, action) => {
                    if (!preview) {
                        if (action === 'DOWN') {
                            setDragging(part.id)
                        } else {
                            setDragging(null)
                        }
                        return
                    }

                    if (part.type !== 'button') {
                        return
                    }

                    let old = [...buttonsPressed]
                    if (action === 'DOWN') {
                        if (!old.find(({ id }) => id === part.id)) {
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
        )

        return renderedPart
    }

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
        if (
            previouslyDragged === dragging ||
            buttonsDown.includes('Shift') ||
            !latch
        ) {
            return () => {}
        }

        setLatch(false)

        if (mode === SELECT && !editLock) {
            const updatedParts = [...layout.parts]
            const index = updatedParts.findIndex(
                ({ id }) => id === previouslyDragged
            )

            const updatedPart = updatedParts[index]

            if (updatedPart && !updatedPart?.relativeTo) {
                if (
                    !partTable[updatedPart.type] ||
                    partTable[updatedPart.type][
                        updatedPart.partId
                    ].shape.toUpperCase() !== CIRCLE
                ) {
                    updatedParts[index] = {
                        ...updatedPart,
                        position: [
                            Math.trunc(
                                (dragX -
                                    workspacePosition[0] -
                                    (calculateSizeOfPart(updatedPart)[0] *
                                        currentScale) /
                                        2) /
                                    currentScale
                            ),
                            Math.trunc(
                                (dragY -
                                    workspacePosition[1] -
                                    (calculateSizeOfPart(updatedPart)[1] *
                                        currentScale) /
                                        2) /
                                    currentScale
                            ),
                        ],
                        origin: [0, 0],
                        anchor: [0, 0],
                    }
                } else {
                    updatedParts[index] = {
                        ...updatedPart,
                        position: [
                            Math.trunc(
                                (dragX - workspacePosition[0]) / currentScale
                            ),
                            Math.trunc(
                                (dragY - workspacePosition[1]) / currentScale
                            ),
                        ],
                    }
                }
                const updatedLayout = { ...layout, parts: updatedParts }

                onLayoutChange(updatedLayout)
            }
        }
    }, [
        dragging,
        latch,
        buttonsDown,
        layout,
        mode,
        editLock,
        onLayoutChange,
        dragX,
        dragY,
        workspacePosition,
        currentScale,
        isDragging,
        previousIsDragging,
        previouslyDragged,
    ])

    let component
    switch (mode) {
        case ADD:
            component = (
                <Part
                    scale={currentScale}
                    part={{
                        partId: placingPartId,
                        type: placingPartType,
                        position: [
                            (mouseX - workspacePosition[0]) / currentScale,
                            (mouseY - workspacePosition[1]) / currentScale,
                        ],
                        origin: [0, 0],
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
                width={window.innerWidth}
                height={window.innerHeight}
                renderOnComponentChange={false}
                options={{ background: 0x1099bb }}
                {...bind()}
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
                    <ButtonStatusContext.Provider value={buttonsPressed}>
                        {layout?.parts?.map((part, index) =>
                            renderPart(part, index)
                        )}
                    </ButtonStatusContext.Provider>
                </Container>
            </Stage>
        </>
    )
}

export default LayoutDisplay
