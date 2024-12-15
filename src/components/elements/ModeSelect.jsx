import { ImportButton, ModeButton, SaveButton, ZoomButton } from "./Buttons";

export const ADD = "ADD";
export const SELECT = "SELECT";
export const PAN = "PAN";

const ModeSelect = ({currentMode, currentZoom, onModeChange, onSave, onImport, onZoomChange}) => {
    const onClick = (e, value) => {
        onModeChange(value);
    }
    return (
        <div className="flex flex-row justify-around items-center gap-10 w-full p-2 bg-slate-400">
            <ModeButton mode="Select" currentMode={currentMode} onClick={onClick} />
            <ModeButton mode="Add" currentMode={currentMode} onClick={onClick} />
            <ModeButton mode="Pan" currentMode={currentMode} onClick={onClick} />
            <ZoomButton currentZoom={currentZoom} onZoomChange={onZoomChange} />
            <ImportButton onClick={onImport} />
            <SaveButton onClick={onSave} />
        </div>
    );
}

export default ModeSelect;