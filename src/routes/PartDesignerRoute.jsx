import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import PartDesigner from '../components/PartDesigner'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

const PartDesignerRoute = () => {
    const { type, id } = useParams()
    const [searchParams] = useSearchParams()

    const [layout, setLayout] = useState({
        units: 'mm',
        panelDimensions: [0, 0],
        parts: [],
    })

    const [preview, setPreview] = useState(false)

    const loadLocal = (type, id) => {
        let dataJSON = localStorage.getItem('taco-truck-data')

        if (!dataJSON) {
            return
        }

        const data = JSON.parse(dataJSON)

        switch (type) {
            case 'projects': {
                const project = data.panelDesigns.find(
                    (design) => id === design.id
                )
                setLayout(project.layout)
                break
            }
            case 'parts': {
                const customPart = data.customParts.find(
                    (part) => id === part.id
                )
                setLayout(customPart.layout)
                break
            }
            default:
                break
        }
    }

    const loadCloud = async (type, id) => {
        try {
            const docRef = doc(
                db,
                type === 'parts' ? 'components' : 'projects',
                id
            )
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                setLayout(data.layout)
            } else {
                console.log('No such document!')
            }
        } catch (e) {
            console.error('Error getting document:', e)
        }
    }

    useEffect(() => {
        if (!type || !id) {
            setLayout({
                units: 'mm',
                panelDimensions: [0, 0],
                parts: [],
            })
            return
        }

        if (searchParams.has('isLocal')) {
            loadLocal(type, id)
        } else {
            loadCloud(type, id)
        }

        if (searchParams.has('preview')) {
            setPreview(true)
        }
    }, [type, id, searchParams])

    return (
        <div className="flex-column flex h-screen w-screen items-center justify-center">
            <PartDesigner
                layout={layout}
                onLayoutChange={setLayout}
                preview={preview}
            />
        </div>
    )
}

export default PartDesignerRoute
