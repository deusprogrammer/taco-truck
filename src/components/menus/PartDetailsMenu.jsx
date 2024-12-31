import React, { useCallback, useEffect } from 'react'
import { calculateRelativePosition } from '../utils'
import BufferedInput from '../elements/BufferedInput'

const PartDetailsMenu = ({
    layout,
    selectedPart,
    onUpdatePart,
    onSecondarySelectPart,
    onSetSecondarySelect,
}) => {
    const onKeyDown = useCallback(
        (evt) => {
            if (evt.key === 'ArrowUp') {
                onUpdatePart(selectedPart.id, {
                    ...selectedPart,
                    position: [
                        selectedPart.position[0],
                        selectedPart.position[1] - 1,
                    ],
                })
            } else if (evt.key === 'ArrowDown') {
                onUpdatePart(selectedPart.id, {
                    ...selectedPart,
                    position: [
                        selectedPart.position[0],
                        selectedPart.position[1] + 1,
                    ],
                })
            } else if (evt.key === 'ArrowLeft') {
                onUpdatePart(selectedPart.id, {
                    ...selectedPart,
                    position: [
                        selectedPart.position[0] - 1,
                        selectedPart.position[1],
                    ],
                })
            } else if (evt.key === 'ArrowRight') {
                onUpdatePart(selectedPart.id, {
                    ...selectedPart,
                    position: [
                        selectedPart.position[0] + 1,
                        selectedPart.position[1],
                    ],
                })
            }
        },
        [selectedPart, onUpdatePart]
    )

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [onKeyDown])

    if (!selectedPart) {
        return null
    }

    const adjustPositionToRelative = (part, referencePart) => {
        let copy = { ...part }

        const relativePartPosition = calculateRelativePosition(
            referencePart,
            layout.parts,
            0,
            0
        )

        copy.position[0] -= relativePartPosition[0]
        copy.position[1] -= relativePartPosition[1]

        return copy
    }

    return (
        <div className="absolute right-[10px] top-[50%] flex max-h-[75%] max-w-[300px] translate-y-[-50%] flex-col gap-1 overflow-y-auto bg-slate-400 p-2">
            <h2 className="text-center text-[1rem] font-bold">Part Details</h2>
            <div className="flex flex-col gap-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                    <label>type:</label>
                    <input value={selectedPart?.type} disabled />
                </div>
                <div className="flex flex-col gap-1">
                    <label>name:</label>
                    <BufferedInput
                        id={`${selectedPart?.id}-part-name`}
                        value={selectedPart?.name}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                name: value,
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>relative to:</label>
                    <button
                        className={`h-8 min-w-20 p-1 ${onSecondarySelectPart ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black`}
                        onClick={() => {
                            onSetSecondarySelect(
                                () => (relativePart) =>
                                    onUpdatePart(selectedPart.id, {
                                        ...adjustPositionToRelative(
                                            selectedPart,
                                            relativePart
                                        ),
                                        relativeTo: relativePart.id,
                                    })
                            )
                        }}
                    >
                        {selectedPart?.relativeTo
                            ? `${selectedPart?.name}`
                            : 'Select'}
                    </button>
                    {selectedPart.relativeTo ? (
                        <button
                            className={`h-8 min-w-20 p-1 ${onSecondarySelectPart ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black`}
                            onClick={() => {
                                const relativePosition =
                                    calculateRelativePosition(
                                        selectedPart,
                                        layout.parts,
                                        layout.panelDimensions[0],
                                        layout.panelDimensions[1]
                                    )
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: relativePosition,
                                    relativeTo: null,
                                })
                            }}
                        >
                            Remove Relation
                        </button>
                    ) : null}
                </div>
                <div className="flex flex-col gap-1">
                    <label>rotation:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-rotation`}
                        type="number"
                        value={selectedPart?.rotation || 0}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                rotation: parseFloat(value),
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>x:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-x`}
                        type="number"
                        value={selectedPart?.position[0]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                position: [
                                    parseFloat(value),
                                    selectedPart.position[1],
                                ],
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>y:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-y`}
                        type="number"
                        value={selectedPart?.position[1]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                position: [
                                    selectedPart.position[0],
                                    parseFloat(value),
                                ],
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>origin x:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-origin-x`}
                        type="number"
                        value={selectedPart?.origin[0]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                origin: [
                                    parseFloat(value),
                                    selectedPart.origin[1],
                                ],
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>origin y:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-origin-y`}
                        type="number"
                        value={selectedPart?.origin[1]}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                origin: [
                                    selectedPart.origin[0],
                                    parseFloat(value),
                                ],
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>anchor x:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-anchor-x`}
                        type="number"
                        value={selectedPart?.anchor?.[0] || 0}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                anchor: [
                                    parseFloat(value),
                                    selectedPart?.anchor?.[1] || 0,
                                ],
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>anchor y:</label>
                    <BufferedInput
                        id={`${selectedPart.id}-anchor-y`}
                        type="number"
                        value={selectedPart?.anchor?.[1] || 0}
                        onChange={(value) => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                anchor: [
                                    selectedPart?.anchor?.[0] || 0,
                                    parseFloat(value),
                                ],
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default PartDetailsMenu
