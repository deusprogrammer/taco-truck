import PartMenu from '../menus/PartMenu'
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
export const EXPORT = 'EXPORT'

const ModeSelect = ({
    currentMode,
    currentPart,
    onModeChange,
    onSave,
    onImport,
    onOptions,
    onChangeAddPart,
}) => {
    const onClick = (e, value) => {
        onModeChange(value)
    }

    return (
        <div className="absolute left-0 top-0 flex w-screen flex-col">
            <div className="flex w-screen flex-row items-center justify-around gap-10 bg-slate-400 p-2">
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
                <ModeButton
                    mode="Export"
                    currentMode={currentMode}
                    onClick={onClick}
                />
                <ImportButton onClick={onImport} />
                <SaveButton onClick={onSave} />
                <OptionsButton onClick={onOptions} />
            </div>
            <div className="flex w-screen flex-row items-center justify-around gap-10 bg-slate-400 p-2">
                <PartMenu
                    active={currentMode === ADD}
                    currentPart={currentPart}
                    onChange={onChangeAddPart}
                />
            </div>
        </div>
    )
}

export default ModeSelect
