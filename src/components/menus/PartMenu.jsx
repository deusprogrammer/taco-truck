import React from 'react'
import { partTable } from '../../data/parts.table'
import { PartSelectionButton } from '../elements/Buttons'

const PartMenu = ({ active, currentPart, onChange }) => {
    if (!active) {
        return null
    }

    return (
        <div className="flex w-full flex-row items-center justify-around gap-10 overflow-y-scroll bg-slate-400 p-2">
            {Object.keys(partTable).map((partType) => {
                return Object.keys(partTable[partType]).map((partId) => {
                    return (
                        <PartSelectionButton
                            placingPart={currentPart}
                            partType={partType}
                            partId={partId}
                            name={`${partId}-${partType}`}
                            onClick={onChange}
                        />
                    )
                })
            })}
        </div>
    )
}

export default PartMenu
