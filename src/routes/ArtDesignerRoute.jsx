import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { augmentLayoutWithAbsolutePositions } from '../components/utils'
import { getComponent, getProject } from '../api/Api'
import { usePartTable } from '../hooks/PartTableHooks'
import ArtDesigner from '../components/ArtDesigner'

const ArtDesignerRoute = () => {
    const { type, id } = useParams()
    const [searchParams] = useSearchParams()
    const { partTable } = usePartTable()

    const [layout, setLayout] = useState({
        units: 'mm',
        panelDimensions: [0, 0],
        parts: [],
    })

    const [preview, setPreview] = useState(false)
    const [isNew, setIsNew] = useState(false)

    const loadLocal = useCallback(
        (type, id) => {
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
                    setLayout(
                        augmentLayoutWithAbsolutePositions(project, partTable)
                    )
                    break
                }
                case 'parts': {
                    const customPart = data.customParts.find(
                        (part) => id === part.id
                    )
                    setLayout(
                        augmentLayoutWithAbsolutePositions(
                            customPart,
                            partTable
                        )
                    )
                    break
                }
                default:
                    break
            }
        },
        [partTable]
    )

    const loadCloud = useCallback(
        async (type, id) => {
            try {
                let component
                if (type === 'parts') {
                    component = await getComponent(id)
                    component = component.layout
                } else {
                    component = await getProject(id)
                }

                setLayout(
                    augmentLayoutWithAbsolutePositions(component, partTable)
                )
            } catch (e) {
                console.error('Error getting document:', e)
            }
        },
        [partTable]
    )

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

            setLayout(
                augmentLayoutWithAbsolutePositions(cachedLayout, partTable)
            )
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
    }, [type, id, searchParams, partTable, loadLocal, loadCloud])

    console.log(`${type}:${id}`)

    if (!layout) {
        return <div>Loading</div>
    }

    return (
        <div style={{ overscrollBehavior: 'none', userSelect: 'none' }}>
            <ArtDesigner
                layout={layout}
                isNew={isNew}
                onLayoutChange={(layout) => {
                    // Augment layout with absolute positions before storing/setting
                    const augmentedLayout = augmentLayoutWithAbsolutePositions(
                        layout,
                        partTable
                    )

                    localStorage.setItem(
                        'taco-truck-cache',
                        JSON.stringify(layout) // Store original for persistence
                    )
                    setLayout(augmentedLayout) // Use augmented for rendering
                }}
                preview={preview}
            />
        </div>
    )
}

export default ArtDesignerRoute
