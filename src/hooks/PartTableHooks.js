import { atom, useAtom } from 'jotai'
import { getParts } from "../api/Api"

// Create atoms
export const partTableAtom = atom(null)
export const partTableLoadingAtom = atom(true)

// Create a derived atom that loads the data
export const partTableLoaderAtom = atom(
    (get) => get(partTableAtom),
    async (get, set) => {
        set(partTableLoadingAtom, true)
        try {
            const data = await getParts(true)
            set(partTableAtom, data)
        } catch (error) {
            console.error('Failed to load parts:', error)
        } finally {
            set(partTableLoadingAtom, false)
        }
    }
)

// Hook to use the part table
export const usePartTable = () => {
    const [partTable] = useAtom(partTableAtom)
    const [loading] = useAtom(partTableLoadingAtom)
    const [, loadParts] = useAtom(partTableLoaderAtom)
    
    return { partTable, loading, loadParts }
}