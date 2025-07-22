import { useRef, useState } from 'react'
import { useResize } from '../../hooks/ContainerHooks'
import { PartSelectionButton } from '../elements/Buttons'
import { usePartTable } from '../../hooks/PartTableHooks'
import { parseSvgStructure } from '../svg-utils'
import { parse } from 'svgson'
import { toast } from 'react-toastify'

const PartPaletteMenu = ({ currentPart, onChangePart }) => {
    const { partTable } = usePartTable()
    const bind = useResize()
    const [sectionsOpen, setSectionsOpen] = useState({})
    const fileInputRef = useRef(null)

    const handleNewPartClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = null // reset so same file can be chosen again
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const svgString = e.target.result
                const svgJSON = await parse(svgString)
                const modelTree = parseSvgStructure(svgJSON)
                // TODO Add model tree to user parts somehow
                toast.success('SVG file loaded successfully')
            } catch (error) {
                toast.error('Invalid JSON file')
            }
        }
        reader.readAsText(file)
    }

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
                                    {partType === 'user' && (
                                        <>
                                            <button
                                                className={`flex min-h-[150px] flex-col justify-around border-2 border-solid border-black bg-slate-600 text-white hover:bg-slate-800 hover:text-white`}
                                                onClick={handleNewPartClick}
                                            >
                                                New Part
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".svg"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </>
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
