import {
    ExportButton,
    ImportButton,
    ModeButton,
    NewButton,
    OpenButton,
    SaveButton,
} from './Buttons'

export const ADD = 'ADD'
export const SELECT = 'SELECT'
export const PAN = 'PAN'

const ModeSelect = ({
    currentMode,
    onModeChange,
    onSave,
    onImport,
    onExport,
}) => {
    const onClick = (e, value) => {
        onModeChange(value)
    }
    return (
        <div className="flex w-full flex-row items-center justify-around gap-10 bg-slate-400 p-2">
            <NewButton />
            <OpenButton />
            <ModeButton
                mode="Select"
                currentMode={currentMode}
                onClick={onClick}
            />
            <ModeButton
                mode="Add"
                currentMode={currentMode}
                onClick={onClick}
            />
            <ImportButton onClick={onImport} />
            <ExportButton onClick={onExport} />
            <SaveButton onClick={onSave} />
        </div>
    )
}

export default ModeSelect
