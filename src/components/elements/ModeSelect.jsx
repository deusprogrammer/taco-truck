import { ExportButton, ImportButton, ModeButton, SaveButton } from "./Buttons";

export const ADD = "ADD";
export const SELECT = "SELECT";
export const PAN = "PAN";

const ModeSelect = ({currentMode, onModeChange, onSave, onImport, onExport}) => {
    const onClick = (e, value) => {
        onModeChange(value);
    }
    return (
        <div className="flex flex-row justify-around items-center gap-10 w-full p-2 bg-slate-400">
            <ModeButton mode="Select" currentMode={currentMode} onClick={onClick} />
            <ModeButton mode="Add" currentMode={currentMode} onClick={onClick} />
            <ImportButton onClick={onImport} />
            <ExportButton onClick={onExport} />
            <SaveButton onClick={onSave} />
        </div>
    );
}

export default ModeSelect;