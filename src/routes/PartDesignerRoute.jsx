import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import PartDesigner from '../components/PartDesigner'
import { getComponent, getProject } from '../api/Api'

const PartDesignerRoute = () => {
    const { type, id } = useParams()
    const [searchParams] = useSearchParams()

    const [layout, setLayout] = useState({
        units: 'mm',
        panelDimensions: [0, 0],
        parts: [],
    })

    const [preview, setPreview] = useState(false)
    const [isNew, setIsNew] = useState(false)

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
            let component
            if (type === 'parts') {
                component = await getComponent(id)
            } else {
                component = await getProject(id)
            }

            setLayout(component)
        } catch (e) {
            console.error('Error getting document:', e)
        }
    }

    useEffect(() => {
        if (!type || !id) {
            const cacheJSON = localStorage.getItem('taco-truck-cache')
            let cachedLayout = {
                units: 'mm',
                panelDimensions: [0, 0],
                parts: [],
            }

            if (cacheJSON) {
                cachedLayout = JSON.parse(cacheJSON)
            }

            setLayout(cachedLayout)
            setIsNew(true)
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
        <div style={{ overscrollBehavior: 'none', userSelect: 'none' }}>
            <PartDesigner
                layout={layout}
                isNew={isNew}
                onLayoutChange={(layout) => {
                    localStorage.setItem(
                        'taco-truck-cache',
                        JSON.stringify(layout)
                    )
                    setLayout(layout)
                }}
                preview={preview}
            />
        </div>
    )
}

export default PartDesignerRoute
