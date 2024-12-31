import {
    ExportButton,
    ImportButton,
    LockToggleButton,
    ModeButton,
    NewButton,
    OpenButton,
    OptionsButton,
    SaveButton,
} from './Buttons'

export const ADD = 'ADD'
export const SELECT = 'SELECT'
export const EDIT = 'EDIT'
export const PAN = 'PAN'

const ModeSelect = ({
    currentMode,
    locked,
    onModeChange,
    onSave,
    onImport,
    onExport,
    onLockToggle,
    onOptions,
}) => {
    const onClick = (e, value) => {
        onModeChange(value)
    }
    return (
        <div className="flex w-full flex-row items-center justify-around gap-10 bg-slate-400 p-2">
            <NewButton />
            <OpenButton />
            <div>
                <ModeButton
                    mode="Select"
                    currentMode={currentMode}
                    onClick={onClick}
                />
                <LockToggleButton locked={locked} onClick={onLockToggle} />
            </div>
            <ModeButton
                mode="Add"
                currentMode={currentMode}
                onClick={onClick}
            />
            <ImportButton onClick={onImport} />
            <ExportButton onClick={onExport} />
            <SaveButton onClick={onSave} />
            <OptionsButton onClick={onOptions} />
        </div>
    )
}

export default ModeSelect
