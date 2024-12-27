import React from 'react'
import { partTable } from '../../data/parts.table'
import BufferedInput from '../elements/BufferedInput'

const ComponentMenu = ({
    layout,
    selectedPartId,
    onLayoutChange,
    onSelect,
    onHover,
    onDelete,
}) => {
    const updatePanelSize = (dimensions) => {
        onLayoutChange({ ...layout, panelDimensions: dimensions })
    }

    const updateCornerRadius = (radius) => {
        onLayoutChange({ ...layout, cornerRadius: radius })
    }

    const deleteComponent = (id) => {
        const updatedParts = layout.parts.filter((part) => part.id !== id)
        onLayoutChange({ ...layout, parts: updatedParts })
        onSelect(null)
    }

    return (
        <div className="absolute left-[10px] top-[50%] flex max-h-[50%] max-w-[300px] translate-y-[-50%] flex-col gap-1 bg-slate-400 p-2">
            <h2 className="text-center text-[1rem] font-bold">
                Component Details
            </h2>
            <div className="flex flex-col gap-1 overflow-y-auto">
                <label>Name:</label>
                <input
                    value={layout?.name || ''}
                    placeholder="part name"
                    onChange={({ target: { value } }) => {
                        onLayoutChange({ ...layout, name: value })
                    }}
                />
                <label>Width:</label>
                <BufferedInput
                    value={layout?.panelDimensions[0] || 0}
                    onChange={(value) =>
                        updatePanelSize([value, layout?.panelDimensions[1]])
                    }
                />
                <label>Height:</label>
                <BufferedInput
                    value={layout?.panelDimensions[1] || 0}
                    onChange={(value) =>
                        updatePanelSize([layout?.panelDimensions[0], value])
                    }
                />
                <label>Corner Radius:</label>
                <BufferedInput
                    value={layout?.cornerRadius || 0}
                    onChange={(value) => updateCornerRadius(value)}
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
    )
}

export default ComponentMenu
