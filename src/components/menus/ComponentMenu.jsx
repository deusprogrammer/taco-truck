import React, { useCallback, useEffect, useState } from 'react'
import { partTable } from '../../data/parts.table'
import BufferedInput from '../elements/BufferedInput'
import { getImageDimensions } from '../utils'
import { useAtom } from 'jotai'
import {
    editLockComponentAtom,
    renderMeasurementsAtom,
    scrollLockComponentAtom,
    workspacePositionAtom,
    zoomAtom,
    zoomLockComponentAtom,
} from '../../atoms/ViewOptions.atom'
import { useRealScaleRatio } from '../../hooks/MouseHooks'

const ComponentMenu = ({
    layout,
    selectedPartId,
    onLayoutChange,
    onSelect,
    onHover,
    onDelete,
}) => {
    const [renderMeasurements, setRenderMeasurements] = useAtom(
        renderMeasurementsAtom
    )
    const realSizeRatio = useRealScaleRatio()
    const [editLock, setEditLock] = useAtom(editLockComponentAtom)
    const [scrollLock, setScrollLock] = useAtom(scrollLockComponentAtom)
    const [zoomLock, setZoomLock] = useAtom(zoomLockComponentAtom)

    const [zoom, setZoom] = useAtom(zoomAtom)
    const [workspacePosition, setWorkspacePosition] = useAtom(
        workspacePositionAtom
    )

    const [toggleMenu, setToggleMenu] = useState(false)

    const updatePanelSize = (dimensions) => {
        onLayoutChange({ ...layout, panelDimensions: dimensions })
    }

    const updateCornerRadius = (radius) => {
        onLayoutChange({ ...layout, cornerRadius: radius })
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
            selectedPartId,
            renderMeasurements,
            editLock,
            scrollLock,
            zoomLock,
            realSizeRatio,
            zoom,
            workspacePosition,
            deleteComponent,
            setRenderMeasurements,
            setEditLock,
            setScrollLock,
            setZoomLock,
            setZoom,
            setWorkspacePosition,
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

    return !toggleMenu ? (
        <div className="absolute left-[10px] top-[50%] flex max-h-[50%] max-w-[300px] translate-y-[-50%] flex-col gap-1 bg-slate-400 p-2">
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
                    <button
                        className={`border-2 border-solid border-black bg-white p-3 hover:bg-slate-600 hover:text-white`}
                        onClick={() =>
                            onLayoutChange({ ...layout, artwork: null })
                        }
                    >
                        Clear Artwork
                    </button>
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
                {[...Object.keys(partTable), 'custom'].map((key) => (
                    <React.Fragment key={`part-type-${key}`}>
                        <h4 className="bg-slate-300">{key.toUpperCase()}</h4>
                        {layout?.parts
                            ?.filter(({ type }) => key === type)
                            .map(({ id, type, partId, name }, index) => (
                                <div
                                    className="flex flex-row gap-0"
                                    key={`part-${index}`}
                                >
                                    <button
                                        className={`p-3 ${selectedPartId === id ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black hover:bg-slate-600 hover:text-white`}
                                        onClick={() => {
                                            onSelect(id)
                                        }}
                                        onMouseEnter={() => {
                                            onHover(id)
                                        }}
                                        onMouseOut={() => {
                                            onHover(null)
                                        }}
                                    >
                                        <b>{name}</b>({partId})
                                    </button>
                                    <button
                                        className={`p-3 ${selectedPartId === id ? 'bg-black text-white' : 'bg-white'} border-2 border-solid border-black hover:bg-slate-600 hover:text-white`}
                                        onClick={() => {
                                            deleteComponent(id)
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    ) : (
        <div className="absolute left-0 top-0 flex h-[100vh] flex-col justify-center">
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
