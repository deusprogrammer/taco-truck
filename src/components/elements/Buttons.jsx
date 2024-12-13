export const ModeButton = ({mode, currentMode, onClick}) => (
    <button 
        className={`text-white w-64 h-20 ${currentMode === mode.toUpperCase() ? "bg-black" : "bg-slate-600"}`} 
        onClick={(e) => {onClick(e, mode.toUpperCase())}}
    >
        {mode}
    </button>
);

export const SaveButton = ({onClick}) => (
    <button 
        className={`text-white w-64 h-20 bg-slate-600`} 
        onClick={onClick}
    >
        Save
    </button>
);

export const PartSelectionButton = ({name, partId, partType, placingPart, onClick}) => (
    <button 
        className={`text-white w-64 h-20 ${placingPart === partId ? "bg-black" : "bg-slate-600"}`} 
        onClick={() => onClick(partType, partId)}
    >
        {name}
    </button>
);