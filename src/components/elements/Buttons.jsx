import { useState } from 'react'
import { useNavigate } from 'react-router'

export const NewButton = () => {
    const navigate = useNavigate()

    return (
        <button
            className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
            onClick={() => {
                navigate('/designer')
            }}
        >
            New
        </button>
    )
}

export const OpenButton = () => {
    const navigate = useNavigate()

    return (
        <button
            className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
            onClick={() => {
                navigate('/manager')
            }}
        >
            Open
        </button>
    )
}

export const ModeButton = ({ mode, currentMode, onClick }) => (
    <button
        className={`h-20 w-64 text-white ${currentMode === mode.toUpperCase() ? 'bg-black' : 'bg-slate-600'} border-2 border-solid border-black`}
        onClick={(e) => {
            onClick(e, mode.toUpperCase())
        }}
    >
        {mode}
    </button>
)

export const SaveButton = ({ onClick }) => (
    <button
        className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
        onClick={onClick}
    >
        Save
    </button>
)

export const ImportButton = ({ onClick }) => (
    <button
        className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
        onClick={onClick}
    >
        Import
    </button>
)

export const PartSelectionButton = ({
    name,
    partId,
    partType,
    placingPart,
    onClick,
}) => (
    <button
        className={`h-20 w-64 text-white ${placingPart === partId ? 'bg-black' : 'bg-slate-600'} border-2 border-solid border-black`}
        onClick={() => onClick(partType, partId)}
    >
        {name}
    </button>
)

export const ZoomButton = ({ currentZoom, onZoomChange }) => (
    <>
        <button
            className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
            disabled={currentZoom === 0.5}
            onClick={() => onZoomChange(-0.5)}
        >
            -
        </button>
        <div>{currentZoom * 100}%</div>
        <button
            className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
            onClick={() => onZoomChange(0.5)}
        >
            +
        </button>
    </>
)

export const ExportButton = ({ onClick }) => {
    const [toggle, setToggle] = useState(false)
    return (
        <button
            className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
            onClick={() => {
                setToggle(!toggle)
                onClick(!toggle)
            }}
        >
            {!toggle ? 'Design Mode' : 'SVG Mode'}
        </button>
    )
}
