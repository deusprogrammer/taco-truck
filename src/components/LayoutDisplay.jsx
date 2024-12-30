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
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import { generateUUID } from './utils'
import {
    useMouseDrag,
    useMousePosition,
    usePrevious,
} from '../hooks/MouseHooks'
import { ADD, SELECT } from './elements/ModeSelect'
import Part from './parts/Part'
import Panel from './parts/Panel'

export const ButtonStatusContext = createContext()

export const useButtonStatus = (part) => {
    const buttonsPressed = useContext(ButtonStatusContext)

    if (part.type !== 'button') {
        return false
    }

    return buttonsPressed?.find(({ id }) => id === part.id)
}

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
    onSecondarySelectPart,
    onLayoutChange,
}) => {
    const componentRef = createRef()
    const websocket = useRef()
    const controllerId = useRef()
    const [mouseX, mouseY] = useMousePosition(workspaceRef)
    const [deltaX, deltaY, isDragging, reset] = useMouseDrag(
        workspaceRef,
        'left'
    )
    const previousIsDragging = usePrevious(isDragging)
    const [buttonsPressed, setButtonsPressed] = useState([])

    const [websocketIp, setWebsocketIp] = useState('localhost:3001')
    const [connected, setConnected] = useState(false)

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
                    (mouseX - workspacePosition[0]) / currentScale,
                    (mouseY - workspacePosition[1]) / currentScale,
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
            mouseX,
            mouseY,
            currentScale,
            placingPartId,
            placingPartType,
            workspacePosition,
        ]
    )

    useEffect(() => {
        const ele = workspaceRef.current

        ele.addEventListener('click', addPart)
        return () => {
            ele.removeEventListener('click', addPart)
        }
    }, [addPart, workspaceRef])

    useEffect(() => {
        if (previousIsDragging === isDragging) {
            return () => {}
        }

        if (!isDragging && selected && mode === SELECT) {
            const updatedParts = [...layout.parts]
            const index = updatedParts.findIndex(({ id }) => id === selected)

            const updatedPart = updatedParts[index]
            updatedParts[index] = {
                ...updatedPart,
                position: [
                    updatedPart.position[0] - deltaX,
                    updatedPart.position[1] - deltaY,
                ],
            }
            const updatedLayout = { ...layout, parts: updatedParts }

            onLayoutChange(updatedLayout)
            reset()
        }
    }, [
        selected,
        layout,
        mode,
        onLayoutChange,
        isDragging,
        previousIsDragging,
        deltaX,
        deltaY,
        reset,
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
        <div ref={workspaceRef} className="h-0 w-full flex-shrink flex-grow">
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
                    <ButtonStatusContext.Provider value={buttonsPressed}>
                        {layout?.parts?.map((part, index) => (
                            <Part
                                key={`part-${part.id || index}`}
                                selectedPartId={selected}
                                hoveredPartId={hovered}
                                scale={currentScale}
                                part={{
                                    ...part,
                                    position:
                                        selected === part.id &&
                                        isDragging &&
                                        mode === SELECT
                                            ? [
                                                  part.position[0] - deltaX,
                                                  part.position[1] - deltaY,
                                              ]
                                            : part.position,
                                }}
                                index={index}
                                parent={layout}
                                onClick={onSecondarySelectPart || onSelectPart}
                                onClickPart={(part, action) => {
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
        </div>
    )
}

export default LayoutDisplay
