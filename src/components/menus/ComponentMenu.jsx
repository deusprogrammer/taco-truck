import React, { useCallback, useEffect, useState } from 'react'
import { partTable } from '../../data/parts.table'
import BufferedInput from '../elements/BufferedInput'
import { getImageDimensions } from '../utils'
import { useAtom } from 'jotai'
import {
    modeAtom,
    renderMeasurementsAtom,
    selectedAtom,
} from '../../atoms/ViewOptions.atom'
import { useResize } from '../../hooks/ContainerHooks'
import { ART_ADJUST } from '../elements/Modes'

const ComponentMenu = ({
    layout,
    selectedPartId,
    onLayoutChange,
    onSelect,
    onHover,
}) => {
    const [renderMeasurements, setRenderMeasurements] = useAtom(
        renderMeasurementsAtom
    )
    const bind = useResize()

    const [toggleMenu, setToggleMenu] = useState(false)

    const [mode, setMode] = useAtom(modeAtom)
    const [, setSelected] = useAtom(selectedAtom)

    const updatePanelSize = (dimensions) => {
        onLayoutChange({ ...layout, panelDimensions: dimensions })
    }

    const updateCornerRadius = (radius) => {
        onLayoutChange({ ...layout, cornerRadius: radius })
    }

    const ungroupCustomPart = (ungroupedPartId) => {
        const customPart = layout.parts.find(({ id }) => id === ungroupedPartId)
        const translatedParts = [...customPart.layout.parts].map((part) => ({
            ...part,
            position: [part.position[0], part.position[1]],
        }))

        const updatedParts = layout.parts.filter(
            (part) => part.id !== ungroupedPartId
        )

        // Find and update part in nested layout
        deleteComponent(ungroupedPartId)
        onLayoutChange({
            ...layout,
            parts: [...translatedParts, ...updatedParts],
        })
    }

    const deleteComponent = useCallback(
        (id) => {
            const updatedParts = layout.parts.filter((part) => part.id !== id)
            onLayoutChange({ ...layout, parts: updatedParts })
            onSelect(null)
        },
        [onLayoutChange, onSelect, layout]
    )

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                onLayoutChange({ ...layout, artwork: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    const loadImageDimensions = useCallback(async () => {
        const [width, height] = await getImageDimensions(layout.artwork)
        onLayoutChange({
            ...layout,
            artworkWidth: width,
            artworkHeight: height,
        })
    }, [layout, onLayoutChange])

    const onKeyDown = useCallback(
        (evt) => {
            if (evt.key === 'Backspace' || evt.key === 'Delete') {
                deleteComponent(selectedPartId)
            } else if (evt.key === 'm') {
                setRenderMeasurements(!renderMeasurements)
            }
        },
        [
            renderMeasurements,
            selectedPartId,
            deleteComponent,
            setRenderMeasurements,
        ]
    )

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [onKeyDown])

    useEffect(() => {
        if (layout.artwork && (!layout.artworkWidth || !layout.artworkHeight)) {
            loadImageDimensions()
        }
    }, [layout, loadImageDimensions])

    const renderParts = (layout) => {
        return [...Object.keys(partTable), 'custom'].map((key) => (
            <React.Fragment key={`part-type-${key}`}>
                {layout?.parts?.filter(({ type }) => key === type).length >
                0 ? (
                    <h4 className="bg-slate-300">{key.toUpperCase()}</h4>
                ) : null}
                {layout?.parts
                    ?.filter(({ type }) => key === type)
                    .map(
                        (
                            { id, type, partId, name, layout: subLayout },
                            index
                        ) => (
                            <>
                                <div
                                    className="flex flex-row gap-0"
                                    key={`part-${index}`}
                                    onMouseLeave={() => {
                                        onHover(null)
                                    }}
                                >
                                    <button
                                        className={`p-3 ${selectedPartId === id ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black hover:bg-slate-600 hover:text-white`}
                                        onClick={() => {
                                            onSelect(id)
                                        }}
                                        onMouseEnter={() => {
                                            onHover(id)
                                        }}
                                    >
                                        <b>{name}</b>
                                        {partId ? `(${partId})` : null}
                                    </button>
                                    {type === 'custom' ? (
                                        <button
                                            onClick={() => {
                                                ungroupCustomPart(id)
                                            }}
                                            className={`p-3 ${selectedPartId === id ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black hover:bg-slate-600 hover:text-white`}
                                        >
                                            Ungroup
                                        </button>
                                    ) : null}
                                    <button
                                        className={`p-3 ${selectedPartId === id ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black hover:bg-slate-600 hover:text-white`}
                                        onClick={() => {
                                            deleteComponent(id)
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                                <div className="ml-2">
                                    {type === 'custom'
                                        ? renderParts(subLayout)
                                        : null}
                                </div>
                            </>
                        )
                    )}
            </React.Fragment>
        ))
    }

    return !toggleMenu ? (
        <div
            className="absolute left-[10px] hidden max-w-[300px] overflow-y-auto border-2 border-white bg-slate-400 p-2 lg:block"
            {...bind()}
        >
            <div className="flex flex-row items-center gap-1">
                <button
                    className="bg-slate-600 p-6 font-bold text-white"
                    onClick={() => setToggleMenu(true)}
                    onPointerDown={() => setToggleMenu(true)}
                >
                    ←
                </button>
                <h2 className="text-center text-[1rem] font-bold">
                    Component Details
                </h2>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
                <label>Name:</label>
                <BufferedInput
                    id={`panel-name`}
                    value={layout?.name || ''}
                    placeholder="part name"
                    onChange={(value) => {
                        onLayoutChange({ ...layout, name: value })
                    }}
                />
                <label>Width:</label>
                <BufferedInput
                    id={`panel-dimension-w`}
                    type="number"
                    value={layout?.panelDimensions[0] || 0}
                    onChange={(value) =>
                        updatePanelSize([value, layout?.panelDimensions[1]])
                    }
                />
                <label>Height:</label>
                <BufferedInput
                    id={`panel-dimension-h`}
                    type="number"
                    value={layout?.panelDimensions[1] || 0}
                    onChange={(value) =>
                        updatePanelSize([layout?.panelDimensions[0], value])
                    }
                />
                <label>Corner Radius:</label>
                <BufferedInput
                    id={`panel-corner-radius`}
                    type="number"
                    value={layout?.cornerRadius || 0}
                    onChange={(value) => updateCornerRadius(value)}
                />
                <label>Artwork:</label>
                {layout?.artwork ? (
                    <>
                        <button
                            className={`border-2 border-solid border-black ${mode === ART_ADJUST ? 'border-white bg-black text-white' : 'bg-white'} p-3 hover:bg-slate-600 hover:text-white`}
                            onClick={() => {
                                if (mode === ART_ADJUST) {
                                    setMode(null)
                                } else {
                                    setMode(ART_ADJUST)
                                }
                                setSelected(null)
                            }}
                        >
                            Adjust Artwork
                        </button>
                        <button
                            className={`border-2 border-solid border-black bg-white p-3 hover:bg-slate-600 hover:text-white`}
                            onClick={() =>
                                onLayoutChange({ ...layout, artwork: null })
                            }
                        >
                            Clear Artwork
                        </button>
                    </>
                ) : (
                    <input type="file" onChange={handleFileChange} />
                )}
                <label>Artwork Dimensions:</label>
                {layout.artworkWidth}px X {layout.artworkHeight}px
                <label>Artwork Zoom:</label>
                <BufferedInput
                    id={`panel-art-zoom`}
                    type="number"
                    immediate={true}
                    value={layout.artworkZoom * 100 || 100}
                    onChange={(value) => {
                        onLayoutChange({ ...layout, artworkZoom: value / 100 })
                    }}
                />
                <label>Artwork X Offset:</label>
                <BufferedInput
                    id={`panel-art-x`}
                    type="number"
                    immediate={true}
                    value={layout.artworkOffset?.[0] || '0'}
                    onChange={(value) => {
                        onLayoutChange({
                            ...layout,
                            artworkOffset: [
                                value,
                                layout.artworkOffset?.[1] || '0',
                            ],
                        })
                    }}
                />
                <label>Artwork Y Offset:</label>
                <BufferedInput
                    id={`panel-art-y`}
                    type="number"
                    immediate={true}
                    value={layout.artworkOffset?.[1] || '0'}
                    onChange={(value) => {
                        onLayoutChange({
                            ...layout,
                            artworkOffset: [
                                layout.artworkOffset?.[0] || '0',
                                value,
                            ],
                        })
                    }}
                />
                <label>Parts:</label>
                {renderParts(layout)}
            </div>
        </div>
    ) : (
        <div className="absolute left-0 top-0 hidden h-[100vh] flex-col justify-center lg:flex">
            <button
                onClick={() => setToggleMenu(false)}
                onPointerDown={() => setToggleMenu(false)}
                className="bg-slate-600 p-6 font-bold text-white"
            >
                →
            </button>
        </div>
    )
}

export default ComponentMenu
