import React, { useCallback, useEffect, useState } from 'react'
import BufferedInput from '../elements/BufferedInput'
import { decimalToRatio, getImageDimensions, removeUnits } from '../utils'
import { useAtom } from 'jotai'
import { renderMeasurementsAtom } from '../../atoms/ViewOptions.atom'
import { useResize } from '../../hooks/ContainerHooks'
import { parseSvgStructure } from '../svg-utils'
import { parse } from 'svgson'

import _ from 'lodash'
import { usePartTable } from '../../hooks/PartTableHooks'

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

    const { partTable } = usePartTable()

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

    const handlePanelFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const svgText = await file.text()

        if (!svgText) return
        const svgJSON = await parse(svgText)
        const panelModel = parseSvgStructure(svgJSON)
        onLayoutChange({
            ...layout,
            panelModel,
            panelDimensions: [
                panelModel.header.viewBox.width,
                panelModel.header.viewBox.height,
            ],
        })
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
        return [...Object.keys(partTable || {}), 'custom'].map((key) => (
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

    // Helper to traverse a path and return [parentNode, key] for the target node
    const getNodeByPath = (path, modelTree) => {
        if (!Array.isArray(path) || path.length === 0) return [null, null]
        const steps = [...path]
        if (typeof steps[0] === 'string' && steps[0] === 'root') steps.shift()

        let node = modelTree
        let parent = null
        let key = null

        for (let i = 0; i < steps.length; i++) {
            if (!node || !node.children) return [null, null]
            parent = node
            key = steps[i]
            node = node.children[Number(key)]
        }
        return [parent, key]
    }

    const deleteNodeByPath = (path, modelTree) => {
        const [parent, key] = getNodeByPath(path, modelTree)
        if (parent && key !== null && parent.children) {
            parent.children[Number(key)] = null
            onLayoutChange({ ...layout, panelModel: modelTree })
        }
    }

    // Simple patch function
    const patchObjectAtPath = (obj, path, value) => {
        const copy = _.cloneDeep(obj)
        _.set(copy, path, value)
        return copy
    }

    const setValuePath = (path, patch, modelTree) => {
        const [parent, key] = getNodeByPath(path, modelTree)
        if (
            parent &&
            key !== null &&
            parent.children &&
            typeof patch === 'object' &&
            patch !== null
        ) {
            Object.assign(parent.children[Number(key)], patch)
            console.log(
                'AFTER SAVE: ' +
                    JSON.stringify(
                        { ...layout, panelModel: modelTree },
                        null,
                        2
                    )
            )
            onLayoutChange({ ...layout, panelModel: modelTree })
        }
    }

    const unsetValuePath = (field, value, modelTree) => {
        // Recursively reset all hovered fields to false
        function resetField(node) {
            if (!node || typeof node !== 'object') return
            if (field in node) node[field] = value
            if (Array.isArray(node.children)) {
                node.children.forEach(resetField)
            }
        }
        resetField(modelTree)
        onLayoutChange({ ...layout, panelModel: modelTree })
    }

    // Update renderPanelModel to use the new setValuePath form
    const renderPanelModel = (panelModel, path = 'root') => {
        if (!panelModel) {
            return <></>
        }

        return (
            <div className="ml-3 flex flex-col border-2 border-black bg-white">
                <div className="flex flex-row gap-2">
                    <div
                        onMouseOver={(e) => {
                            let copy = { ...layout.panelModel }
                            unsetValuePath('hovered', false, copy)
                            setValuePath(
                                path.split(','),
                                { hovered: true },
                                copy
                            )
                            e.stopPropagation()
                        }}
                        onMouseOut={(e) => {
                            let copy = { ...layout.panelModel }
                            unsetValuePath('hovered', false, copy)
                            e.stopPropagation()
                        }}
                        className="cursor-pointer font-extrabold"
                    >
                        {panelModel.type || 'root'}
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            checked={panelModel.graphical}
                            onChange={({ target: { checked } }) => {
                                let copy = { ...layout.panelModel }
                                setValuePath(
                                    path.split(','),
                                    { graphical: checked },
                                    copy
                                )
                            }}
                        />
                        <label>graphical</label>
                    </div>
                    <div>
                        <button
                            className="border-1 m-[1px] bg-slate-500 text-white"
                            onClick={() => {
                                let copy = { ...layout.panelModel }
                                deleteNodeByPath(path.split(','), copy)
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <div className="ml-3">
                    {panelModel.children?.map((child, index) =>
                        renderPanelModel(child, `${path},${index}`)
                    )}
                </div>
            </div>
        )
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
                <label>Created By:</label>
                <div className="ml-3">{layout?.owner}</div>
                <label>Panel SVG</label>
                {!layout?.panelModel && (
                    <input type="file" onChange={handlePanelFileChange} />
                )}
                {layout?.panelModel && (
                    <>
                        <button
                            className={`border-2 border-solid border-black bg-white p-3 hover:bg-slate-600 hover:text-white`}
                            onClick={() =>
                                onLayoutChange({
                                    ...layout,
                                    panelModel: null,
                                    panelDimensions: [0, 0],
                                })
                            }
                        >
                            Clear SVG
                        </button>
                    </>
                )}
                <label>Units:</label>
                <select
                    value={layout?.units}
                    onChange={(value) => {
                        onLayoutChange({ ...layout, units: value })
                    }}
                >
                    <option value="mm">millimeters</option>
                    <option value="in">inches</option>
                </select>
                <label>Width:</label>
                <BufferedInput
                    id={`panel-dimension-w`}
                    type="number"
                    value={layout?.panelDimensions?.[0] || 0}
                    onChange={(value) =>
                        updatePanelSize([value, layout?.panelDimensions[1]])
                    }
                />
                <label>Height:</label>
                <BufferedInput
                    id={`panel-dimension-h`}
                    type="number"
                    value={layout?.panelDimensions?.[1] || 0}
                    onChange={(value) =>
                        updatePanelSize([layout?.panelDimensions[0], value])
                    }
                />

                {!layout.panelModel && (
                    <>
                        <label>Corner Radius:</label>
                        <BufferedInput
                            id={`panel-corner-radius`}
                            type="number"
                            value={layout?.cornerRadius || 0}
                            onChange={(value) => updateCornerRadius(value)}
                        />
                    </>
                )}

                {layout.panelModel && (
                    <>
                        <label>Panel Model Attributes:</label>
                        <div className="ml-5 flex flex-col">
                            <label>Width:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="number"
                                value={removeUnits(
                                    layout.panelModel?.header.width
                                )}
                                onChange={(value) => {
                                    let updated = patchObjectAtPath(
                                        layout.panelModel,
                                        'header.width',
                                        value + layout.units
                                    )
                                    updated = patchObjectAtPath(
                                        updated,
                                        'header.viewBox.width',
                                        value
                                    )
                                    onLayoutChange({
                                        ...layout,
                                        panelModel: updated,
                                    })
                                }}
                            />
                            <label>Height:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="number"
                                value={removeUnits(
                                    layout.panelModel?.header.height
                                )}
                                onChange={(value) => {
                                    let updated = patchObjectAtPath(
                                        layout.panelModel,
                                        'header.height',
                                        value + layout.units
                                    )
                                    updated = patchObjectAtPath(
                                        updated,
                                        'header.viewBox.height',
                                        value
                                    )
                                    onLayoutChange({
                                        ...layout,
                                        panelModel: updated,
                                    })
                                }}
                            />
                            <label>Ratio:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="string"
                                value={decimalToRatio(
                                    removeUnits(
                                        layout.panelModel?.header.width
                                    ) /
                                        removeUnits(
                                            layout.panelModel?.header.height
                                        )
                                )}
                                onChange={(value) => {
                                    setValuePath(
                                        'header',
                                        { height: value },
                                        layout.panelModel
                                    )
                                }}
                                disabled
                            />
                        </div>
                        <label>Panel Model View Box:</label>
                        <div className="ml-5 flex flex-col">
                            <label>x:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="number"
                                value={layout.panelModel?.header.viewBox.x}
                                onChange={(value) => {
                                    let updated = patchObjectAtPath(
                                        layout.panelModel,
                                        'header.viewBox.x',
                                        value
                                    )
                                    onLayoutChange({
                                        ...layout,
                                        panelModel: updated,
                                    })
                                }}
                            />
                            <label>y:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="number"
                                value={layout.panelModel?.header.viewBox.y}
                                onChange={(value) => {
                                    let updated = patchObjectAtPath(
                                        layout.panelModel,
                                        'header.viewBox.y',
                                        value
                                    )
                                    onLayoutChange({
                                        ...layout,
                                        panelModel: updated,
                                    })
                                }}
                            />
                            <label>Width:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="number"
                                value={layout.panelModel?.header.viewBox.width}
                                onChange={(value) => {
                                    let updated = patchObjectAtPath(
                                        layout.panelModel,
                                        'header.viewBox.width',
                                        value
                                    )
                                    onLayoutChange({
                                        ...layout,
                                        panelModel: updated,
                                    })
                                }}
                            />
                            <label>Height:</label>
                            <BufferedInput
                                id={`panel-corner-radius`}
                                type="number"
                                value={layout.panelModel?.header.viewBox.height}
                                onChange={(value) => {
                                    let updated = patchObjectAtPath(
                                        layout.panelModel,
                                        'header.viewBox.height',
                                        value
                                    )
                                    onLayoutChange({
                                        ...layout,
                                        panelModel: updated,
                                    })
                                }}
                            />
                        </div>
                        <label>Panel Model:</label>
                        {renderPanelModel(layout.panelModel)}
                    </>
                )}
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
