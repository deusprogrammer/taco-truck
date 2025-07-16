import { useState } from 'react'
import { useResize } from '../../hooks/ContainerHooks'
import { PartSelectionButton } from '../elements/Buttons'
import { usePartTable } from '../../hooks/PartTableHooks'

const PartPaletteMenu = ({ currentPart, onChangePart }) => {
    const { partTable } = usePartTable()
    const bind = useResize()
    const [sectionsOpen, setSectionsOpen] = useState({})

    return (
        <div
            className="absolute right-[10px] hidden w-[250px] flex-col gap-1 overflow-y-auto border-2 border-white bg-slate-400 p-2 lg:flex"
            {...bind()}
        >
            <h2 className="text-center text-[1rem] font-bold">Part Palette</h2>
            <div className="flex flex-col gap-1 overflow-y-auto">
                {Object.keys(partTable).map((partType) => {
                    let label =
                        partType !== 'user' ? partType + 's' : 'user created'
                    return (
                        <>
                            <button
                                className="text-left text-[1.2rem] font-bold"
                                onClick={() =>
                                    setSectionsOpen({
                                        ...sectionsOpen,
                                        [partType]: !sectionsOpen[partType],
                                    })
                                }
                            >
                                {sectionsOpen[partType] ? 'v' : '>'} {label}
                            </button>
                            {sectionsOpen[partType] && (
                                <div className="grid grid-cols-2 gap-1">
                                    {Object.keys(partTable[partType]).map(
                                        (partId) => {
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
                                        }
                                    )}
                                </div>
                            )}
                        </>
                    )
                })}
            </div>
        </div>
    )
}

export default PartPaletteMenu
