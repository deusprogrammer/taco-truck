export const ModeButton = ({mode, currentMode, onClick}) => (
    <button 
        className={`text-white w-64 h-20 ${currentMode === mode.toUpperCase() ? "bg-black" : "bg-slate-600"} border-solid border-2 border-black`} 
        onClick={(e) => {onClick(e, mode.toUpperCase())}}
    >
        {mode}
    </button>
);

export const SaveButton = ({onClick}) => (
    <button 
        className={`text-white w-64 h-20 bg-slate-600 border-solid border-2 border-black`} 
        onClick={onClick}
    >
        Save
    </button>
);

export const ImportButton = ({onClick}) => (
    <button 
        className={`text-white w-64 h-20 bg-slate-600 border-solid border-2 border-black`} 
        onClick={onClick}
    >
        Import
    </button>
);

export const PartSelectionButton = ({name, partId, partType, placingPart, onClick}) => (
    <button 
        className={`text-white w-64 h-20 ${placingPart === partId ? "bg-black" : "bg-slate-600"} border-solid border-2 border-black`} 
        onClick={() => onClick(partType, partId)}
    >
        {name}
    </button>
);

export const ZoomButton = ({currentZoom, onZoomChange}) => (
    <>
        <button 
            className={`text-white bg-slate-600 w-64 h-20 border-solid border-2 border-black`} 
            disabled={currentZoom === 0.5}
            onClick={() => onZoomChange(-0.5)}
        >
            -
        </button>
        <div>
            {currentZoom * 100}%
        </div>
        <button 
            className={`text-white bg-slate-600 w-64 h-20 border-solid border-2 border-black`} 
            onClick={() => onZoomChange(0.5)}
        >
            +
        </button>
    </>
);