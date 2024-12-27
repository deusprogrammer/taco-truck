import { collection, getDocs } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase.config'

const ImportModal = ({ open, onImportComplete, onClose }) => {
    const [customParts, setCustomParts] = useState([])
    const [selectedParts, setSelectedParts] = useState([])

    useEffect(() => {
        const loadLocalData = () => {
            let dataJSON = localStorage.getItem('taco-truck-data')

            if (!dataJSON) {
                return []
            }

            return JSON.parse(dataJSON).customParts.map((part) => ({
                ...part,
                isLocal: true,
            }))
        }

        const loadCloudData = async () => {
            const componentsSnapshot = await getDocs(
                collection(db, 'components')
            )
            return componentsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        }

        const fetchData = async () => {
            const localParts = loadLocalData()
            const cloudParts = await loadCloudData()
            setCustomParts([...cloudParts, ...localParts])
        }

        if (open) {
            fetchData()
        }
    }, [open])

    if (!open) {
        return null
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            <div className="flex flex-col gap-2 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.5rem]">Import</h3>
                <select
                    className="p-2 text-black"
                    multiple={true}
                    value={selectedParts}
                    onChange={({ target: { selectedOptions } }) => {
                        const options = [...selectedOptions]
                        const values = options.map((option) => option.value)
                        setSelectedParts(values)
                    }}
                >
                    {customParts.map(({ name, id, isLocal }) => (
                        <option
                            key={`cp-${id}`}
                            value={`${isLocal ? 'local-' : 'cloud-'}${id}`}
                            className={isLocal ? 'text-teal-500' : ''}
                        >
                            {name}
                        </option>
                    ))}
                </select>
                <div className="flex flex-row gap-1 text-[1rem]">
                    <button
                        className="bg-slate-500 p-2"
                        onClick={() => {
                            onImportComplete(selectedParts)
                            onClose()
                        }}
                    >
                        Import
                    </button>
                    <button className="bg-slate-500 p-2" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportModal
