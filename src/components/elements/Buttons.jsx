import { useNavigate } from 'react-router'
import { useRealScaleRatio } from '../../hooks/MouseHooks'
import LayoutDisplaySvg from '../svg/LayoutDisplaySvg'
import { partTable } from '../../data/parts.table'

export const NewButton = () => {
    const navigate = useNavigate()

    return (
        <button
            className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
            onClick={() => {
                localStorage.removeItem('taco-truck-cache')
                navigate(`/designer?ts=${new Date().getTime()}`)
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
            onClick(mode.toUpperCase())
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

export const OptionsButton = ({ onClick }) => (
    <button
        className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
        onClick={onClick}
    >
        Options
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
        className={`flex min-h-[150px] flex-col justify-around text-white ${placingPart === partId ? 'bg-black' : 'bg-slate-600'} border-2 border-solid border-black hover:bg-slate-800 hover:text-white`}
        onClick={() => onClick(partType, partId)}
    >
        <LayoutDisplaySvg
            scale={1}
            layout={{
                panelDimensions: [0, 0],
                parts: [
                    {
                        ...partTable[partType][partId],
                        type: partType,
                        partId,
                        position: [0, 0],
                        origin: [0, 0],
                        anchor: [0, 0],
                        relativeTo: null,
                    },
                ],
            }}
            hideButton={true}
        />
        {partTable[partType][partId].name}
    </button>
)

export const ZoomButton = ({ currentZoom, onZoomChange }) => (
    <div className="flex flex-row items-center justify-center">
        <button
            className={`h-20 w-20 border-2 border-solid border-black bg-slate-600 text-white`}
            disabled={currentZoom === 0.5}
            onClick={() => onZoomChange(-0.1)}
        >
            -
        </button>
        <div>{Math.trunc(currentZoom * 100)}%</div>
        <button
            className={`h-20 w-20 border-2 border-solid border-black bg-slate-600 text-white`}
            onClick={() => onZoomChange(0.1)}
        >
            +
        </button>
    </div>
)

export const ToggleButton = ({ onClick, toggle, children }) => {
    return (
        <button
            className={`h-20 w-auto border-2 border-solid border-black ${toggle ? 'bg-black' : 'bg-slate-600'} p-2 text-white`}
            onClick={() => {
                onClick(!toggle)
            }}
        >
            {children}
        </button>
    )
}

export const LockToggleButton = ({ onClick, locked, children }) => {
    return (
        <button
            className={`h-20 w-20 border-2 border-solid border-black ${locked ? 'bg-black' : 'bg-slate-600'} p-2 text-white`}
            title="Lock the current configuration so it does not move during select"
            onClick={() => {
                onClick(!locked)
            }}
        >
            {children}&nbsp;
            {!locked ? '🔓' : '🔒'}
        </button>
    )
}

export const RealSizeZoomButton = ({ zoomValue, onClick }) => {
    const realSizeRatio = useRealScaleRatio()

    return (
        <button
            className={`h-20 w-auto border-2 border-solid border-black ${zoomValue === realSizeRatio ? 'bg-black' : 'bg-slate-600'} p-2 text-white`}
            title="Lock the current configuration so it does not move during select"
            onClick={onClick}
        >
            Real Size
        </button>
    )
}
