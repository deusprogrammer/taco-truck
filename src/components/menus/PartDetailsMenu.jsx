import React, { useCallback, useEffect } from 'react'
import { useAtom } from 'jotai'
import { calculateRelativePosition } from '../utils'
import BufferedInput from '../elements/BufferedInput'
import { useResize } from '../../hooks/ContainerHooks'
import { mappingStyleAtom } from '../../atoms/ViewOptions.atom'
import { MAPPINGS } from '../elements/Constants'
import { usePartTable } from '../../hooks/PartTableHooks'

const PartDetailsMenu = ({
    layout,
    selectedPart,
    onUpdatePart,
    onSecondarySelectPart,
    onSetSecondarySelect,
}) => {
    const bind = useResize()

    const [mappingStyle] = useAtom(mappingStyleAtom)
    const { partTable } = usePartTable()

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

    if (!selectedPart) {
        return null
    }

    return (
        <div
            className="absolute right-[10px] hidden max-w-[300px] flex-col gap-1 overflow-y-auto border-2 border-white bg-slate-400 p-2 lg:flex"
            {...bind()}
        >
            <h2 className="text-center text-[1rem] font-bold">Part Details</h2>
            <div className="flex flex-col gap-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                    <label>type:</label>
                    <select
                        value={`${selectedPart?.type}-${selectedPart?.partId}`}
                        id={`${selectedPart?.id}-part-type`}
                        onChange={({ target: { value } }) => {
                            const [type, ...partId] = value.split('-')
                            // Update the part
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                partId: partId.join('-'),
                                type,
                                name: `${type}-${partId.join('-')}`,
                            })
                        }}
                        disabled={
                            selectedPart.type === 'custom' ||
                            selectedPart.type === 'user'
                        }
                    >
                        {[
                            ...Object.keys(partTable.button).map((partId) => ({
                                type: `button`,
                                partId,
                            })),
                            ...Object.keys(partTable.hole).map((partId) => ({
                                type: `hole`,
                                partId,
                            })),
                        ].map((part) => (
                            <option
                                key={`${selectedPart?.id}-part-type-${part.type}-${part.partId}`}
                                value={`${part.type}-${part.partId}`}
                            >
                                {part.type}: {part.partId}
                            </option>
                        ))}
                        <option
                            key={`${selectedPart?.id}-part-type-custom`}
                            value={`custom-${selectedPart.partId}`}
                        >
                            custom: {selectedPart.partId}
                        </option>
                        <option
                            key={`${selectedPart?.id}-part-type-custom`}
                            value={`user-${selectedPart.partId}`}
                        >
                            user: {selectedPart.partId}
                        </option>
                    </select>
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
                {selectedPart.type === 'button' ? (
                    <div className="flex flex-col gap-1">
                        <label>mapping:</label>
                        <select
                            id={`${selectedPart?.id}-part-button-mapping`}
                            value={selectedPart?.mapping}
                            defaultValue={'unassigned'}
                            onChange={({ target: { value } }) => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    mapping: value,
                                })
                            }}
                        >
                            <option value={'unassigned'}>Unassigned</option>
                            {MAPPINGS[mappingStyle].map((button, index) => (
                                <option
                                    key={`${selectedPart?.id}-button-${index}`}
                                    value={index}
                                >
                                    {button}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
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
                <h3 className="text-center text-[0.8rem] font-bold">
                    Quick Alignment
                </h3>
                <button
                    className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                    onClick={() => {
                        onUpdatePart(selectedPart.id, {
                            ...selectedPart,
                            position: [0, selectedPart.position[1]],
                            anchor: [0.5, selectedPart.anchor[1]],
                            origin: [0.5, selectedPart.origin[1]],
                        })
                    }}
                >
                    Center Horizontally
                </button>
                <button
                    className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                    onClick={() => {
                        onUpdatePart(selectedPart.id, {
                            ...selectedPart,
                            position: [selectedPart.position[0], 0],
                            anchor: [selectedPart.anchor[0], 0.5],
                            origin: [selectedPart.origin[0], 0.5],
                        })
                    }}
                >
                    Center Vertically
                </button>
                <button
                    className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                    onClick={() => {
                        onUpdatePart(selectedPart.id, {
                            ...selectedPart,
                            position: [0, 0],
                            anchor: [0.5, 0.5],
                            origin: [0.5, 0.5],
                        })
                    }}
                >
                    Center Both
                </button>
                <div className="flex flex-col gap-0">
                    <div className="flex flex-row justify-center">
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [0, 0],
                                })
                            }}
                        >
                            UL
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [0.5, 0],
                                })
                            }}
                        >
                            UM
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [1, 0],
                                })
                            }}
                        >
                            UR
                        </button>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [0, 0.5],
                                })
                            }}
                        >
                            ML
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [0.5, 0.5],
                                })
                            }}
                        >
                            MM
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [1, 0.5],
                                })
                            }}
                        >
                            MR
                        </button>
                    </div>
                    <div className="flex flex-row justify-center">
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [0, 1],
                                })
                            }}
                        >
                            LL
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [0.5, 1],
                                })
                            }}
                        >
                            LM
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    position: [0, 0],
                                    anchor: [0.5, 0.5],
                                    origin: [1, 1],
                                })
                            }}
                        >
                            LR
                        </button>
                    </div>
                </div>
                <div className="flex flex-row">
                    <button
                        className={`min-w-20 border-2 border-solid border-black bg-white p-1`}
                        onClick={() => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                origin: [
                                    selectedPart.origin[0] * 0.5,
                                    selectedPart.origin[1],
                                ],
                            })
                        }}
                    >
                        Split Left
                    </button>
                    <div className="flex flex-col">
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    origin: [
                                        selectedPart.origin[0],
                                        selectedPart.origin[1] * 0.5,
                                    ],
                                })
                            }}
                        >
                            Split Up
                        </button>
                        <button
                            className={`h-8 min-w-20 border-2 border-solid border-black bg-white p-1`}
                            onClick={() => {
                                onUpdatePart(selectedPart.id, {
                                    ...selectedPart,
                                    origin: [
                                        selectedPart.origin[0],
                                        selectedPart.origin[1] * 1.5,
                                    ],
                                })
                            }}
                        >
                            Split Down
                        </button>
                    </div>
                    <button
                        className={`min-w-20 border-2 border-solid border-black bg-white p-1`}
                        onClick={() => {
                            onUpdatePart(selectedPart.id, {
                                ...selectedPart,
                                origin: [
                                    selectedPart.origin[0] * 1.5,
                                    selectedPart.origin[1],
                                ],
                            })
                        }}
                    >
                        Split Right
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PartDetailsMenu
