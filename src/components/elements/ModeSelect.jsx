import {
    ExportButton,
    ImportButton,
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
    onRealSizeZoom,
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
        <div className="absolute left-0 top-0 flex w-screen flex-row items-center justify-around gap-10 bg-slate-400 p-2">
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
            <OptionsButton onClick={onOptions} />
        </div>
    )
}

export default ModeSelect
