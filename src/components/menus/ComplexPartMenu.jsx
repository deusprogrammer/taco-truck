import BufferedInput from '../elements/BufferedInput'
import { toast } from 'react-toastify'
import { parseSvgStructure } from '../svg-utils'
import { parse } from 'svgson'

export const PAN_TOOL = 'pan'
export const LINE_TOOL = 'line'
export const CURVE_TOOL = 'curve'
export const CIRCLE_TOOL = 'circle'
export const SQUARE_TOOL = 'square'
export const MOVE_TOOL = 'move'

const ComplexPartMenu = ({
    part,
    selectedTool,
    onToolChange,
    onPartChange,
    onSave,
}) => {
    const fileHandler = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const svgString = e.target.result
                const svgJSON = await parse(svgString)
                const modelTree = parseSvgStructure(svgJSON)
                onPartChange({
                    ...part,
                    modelTree,
                })
                toast.success('SVG file loaded successfully')
            } catch (error) {
                toast.error('Invalid JSON file')
            }
        }
        reader.readAsText(file)
    }

    const selectedToolStyle =
        'w-[50px] bg-gray text-black border-white border-solid border-2'
    const unselectedToolStyle = 'w-[50px] bg-white text-black'

    return (
        <>
            <div className="absolute left-[10px] hidden h-screen max-w-[300px] flex-col gap-1 overflow-y-auto border-2 border-white bg-slate-400 p-2 lg:flex">
                <h2 className="text-center text-[1rem] font-bold">
                    Complex Part Details
                </h2>
                <label>Name</label>
                <BufferedInput
                    value={part.name}
                    onChange={(name) => onPartChange({ ...part, name })}
                />
                <label>Import SVG</label>
                <input type="file" onChange={fileHandler} />
                <h2 className="text-center text-[1rem] font-bold">Actions</h2>
                <div>
                    <button
                        className="w-[50px] bg-white text-black"
                        onClick={onSave}
                    >
                        Save
                    </button>
                </div>
                <h2 className="text-center text-[1rem] font-bold">Tools</h2>
                <div className="grid grid-cols-4 gap-1">
                    <button
                        className={
                            selectedTool === PAN_TOOL
                                ? selectedToolStyle
                                : unselectedToolStyle
                        }
                        onClick={() => onToolChange(PAN_TOOL)}
                    >
                        Pan
                    </button>
                    <button
                        className={
                            selectedTool === MOVE_TOOL
                                ? selectedToolStyle
                                : unselectedToolStyle
                        }
                        onClick={() => onToolChange(MOVE_TOOL)}
                    >
                        Move
                    </button>
                    <button
                        className={
                            selectedTool === LINE_TOOL
                                ? selectedToolStyle
                                : unselectedToolStyle
                        }
                        onClick={() => onToolChange(LINE_TOOL)}
                    >
                        Line
                    </button>
                    <button
                        className={
                            selectedTool === CURVE_TOOL
                                ? selectedToolStyle
                                : unselectedToolStyle
                        }
                        onClick={() => onToolChange(CURVE_TOOL)}
                    >
                        Curve
                    </button>
                    <button
                        className={
                            selectedTool === SQUARE_TOOL
                                ? selectedToolStyle
                                : unselectedToolStyle
                        }
                        onClick={() => onToolChange(SQUARE_TOOL)}
                    >
                        Square
                    </button>
                    <button
                        className={
                            selectedTool === CIRCLE_TOOL
                                ? selectedToolStyle
                                : unselectedToolStyle
                        }
                        onClick={() => onToolChange(CIRCLE_TOOL)}
                    >
                        Circle
                    </button>
                </div>
            </div>
        </>
    )
}

export default ComplexPartMenu
