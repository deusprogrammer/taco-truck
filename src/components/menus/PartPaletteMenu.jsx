import { partTable } from '../../data/parts.table'
import { useResize } from '../../hooks/ContainerHooks'
import { PartSelectionButton } from '../elements/Buttons'

const PartPaletteMenu = ({ currentPart, onChangePart }) => {
    const bind = useResize()

    return (
        <div
            className="absolute right-[10px] hidden max-w-[300px] flex-col gap-1 overflow-y-auto border-2 border-white bg-slate-400 p-2 lg:flex"
            {...bind()}
        >
            <h2 className="text-center text-[1rem] font-bold">Part Palette</h2>
            <div className="grid grid-cols-2 gap-1 overflow-y-auto">
                {Object.keys(partTable).map((partType) => {
                    return Object.keys(partTable[partType]).map((partId) => {
                        return (
                            <PartSelectionButton
                                key={`part-menu-${partType}-${partId}`}
                                placingPart={currentPart}
                                partType={partType}
                                partId={partId}
                                name={`${partId}-${partType}`}
                                onClick={onChangePart}
                            />
                        )
                    })
                })}
            </div>
        </div>
    )
}

export default PartPaletteMenu
