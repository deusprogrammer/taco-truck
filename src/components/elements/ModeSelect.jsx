import { ModeButton, SaveButton } from "./Buttons";

export const ADD = "ADD";
export const SELECT = "SELECT";
export const PAN = "PAN";

const ModeSelect = ({currentMode, onModeChange, onSave}) => {
    const onClick = (e, value) => {
        console.log("FFFFAAARRRTTT");
        onModeChange(value);
    }
    return (
        <div className="flex flex-row justify-around items-center gap-10 w-full p-2 bg-slate-400">
            <ModeButton mode="Select" currentMode={currentMode} onClick={onClick} />
            <ModeButton mode="Add" currentMode={currentMode} onClick={onClick} />
            <ModeButton mode="Pan" currentMode={currentMode} onClick={onClick} />
            <SaveButton onClick={onSave} />
        </div>
    );
}

export default ModeSelect;