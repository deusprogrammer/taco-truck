import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LayoutDisplaySvg from '../components/svg/LayoutDisplaySvg'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.config'

import config from '../../package.json'
import { convertPointsObjectsToArrays } from '../components/utils'
import { toast } from 'react-toastify'

const ComponentManagerRoute = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialSearch = searchParams.get('search') || ''
    const initialShowBasePanels = searchParams.get('showBasePanels') === 'true'
    const [customParts] = useState([])
    const [panelDesigns] = useState([])
    const [combinedProjects, setCombinedProjects] = useState([])
    const [combinedParts, setCombinedParts] = useState([])
    const [search, setSearch] = useState(initialSearch)
    const [
        showPanelsWithoutButtonsOrParts,
        setShowPanelsWithoutButtonsOrParts,
    ] = useState(initialShowBasePanels)

    useEffect(() => {
        setSearch(searchParams.get('search') || '')
        setShowPanelsWithoutButtonsOrParts(
            searchParams.get('showBasePanels') === 'true'
        )
    }, [searchParams])

    useEffect(() => {
        const loadLocalData = () => {
            let dataJSON = localStorage.getItem('taco-truck-data')
            if (!dataJSON) {
                return { customParts: [], panelDesigns: [] }
            }
            return JSON.parse(dataJSON)
        }

        const loadCloudData = async () => {
            const projectsSnapshot = await getDocs(collection(db, 'projects'))
            const componentsSnapshot = await getDocs(
                collection(db, 'components')
            )

            const projects = projectsSnapshot.docs.map((doc) => {
                const data = { id: doc.id, ...doc.data() }
                if (data.layout) convertPointsObjectsToArrays(data.layout)
                return data
            })
            const components = componentsSnapshot.docs.map((doc) => {
                const data = { id: doc.id, ...doc.data() }
                if (data.layout) convertPointsObjectsToArrays(data.layout)
                return data
            })

            return { projects, components }
        }

        const combineData = (localData, cloudData) => {
            const combinedProjects = [
                ...cloudData.projects,
                ...localData.panelDesigns.map((project) => ({
                    ...project,
                    isLocal: true,
                })),
            ].sort((a, b) => {
                const areaA =
                    a.layout.panelDimensions[0] * a.layout.panelDimensions[1]
                const areaB =
                    b.layout.panelDimensions[0] * b.layout.panelDimensions[1]
                if (areaA !== areaB) return areaA - areaB
                return a.name.localeCompare(b.name)
            })
            const combinedParts = [
                ...cloudData.components,
                ...localData.customParts.map((part) => ({
                    ...part,
                    isLocal: true,
                })),
            ].sort((a, b) => a.name.localeCompare(b.name))

            setCombinedProjects(combinedProjects)
            setCombinedParts(combinedParts)
        }

        const fetchData = async () => {
            const localData = loadLocalData()
            const cloudData = await loadCloudData()
            combineData(localData, cloudData)
        }

        fetchData()
    }, [])

    const deleteProject = (idToDelete) => {
        const filtered = [
            ...combinedProjects.filter(({ id }) => id !== idToDelete),
        ]
        setCombinedProjects(filtered)
        localStorage.setItem(
            'taco-truck-data',
            JSON.stringify({
                panelDesigns: filtered.filter((project) => project.isLocal),
                customParts,
            })
        )
    }

    const deletePart = (idToDelete) => {
        const filtered = [
            ...combinedParts.filter(({ id }) => id !== idToDelete),
        ]
        setCombinedParts(filtered)
        localStorage.setItem(
            'taco-truck-data',
            JSON.stringify({
                panelDesigns,
                customParts: filtered.filter((part) => part.isLocal),
            })
        )
    }

    // Filter projects and parts by search
    let filteredProjects = combinedProjects.filter((project) =>
        project.name?.toLowerCase().includes(search.toLowerCase())
    )
    const filteredParts = combinedParts.filter((part) =>
        part.name?.toLowerCase().includes(search.toLowerCase())
    )

    // Add filter for panels with no buttons or custom parts
    if (showPanelsWithoutButtonsOrParts) {
        filteredProjects = filteredProjects.filter((project) => {
            // If there are no parts, or all parts are type 'hole', keep it
            const parts = project.layout?.parts || []
            return parts.every((part) => part.type === 'hole')
        })
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-600 text-white">
            <div className="flex flex-row items-center justify-center gap-10">
                <img
                    className="w-[100px]"
                    alt="logo"
                    src={`${process.env.PUBLIC_URL}/logo.png`}
                />
                <h1 className="text-[2rem]">
                    Project Taco Truck v{config.version}
                </h1>
            </div>
            <div className="mx-auto flex w-[90%] flex-col justify-center">
                <div className="mb-4 flex flex-col items-center justify-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setSearchParams((params) => {
                                const newParams = new URLSearchParams(params)
                                if (e.target.value) {
                                    newParams.set('search', e.target.value)
                                } else {
                                    newParams.delete('search')
                                }
                                if (showPanelsWithoutButtonsOrParts) {
                                    newParams.set('showBasePanels', 'true')
                                } else {
                                    newParams.delete('showBasePanels')
                                }
                                return newParams
                            })
                        }}
                        className="w-80 rounded p-2 text-black"
                    />
                    <label className="">
                        <input
                            type="checkbox"
                            checked={showPanelsWithoutButtonsOrParts}
                            onChange={(e) => {
                                setShowPanelsWithoutButtonsOrParts(
                                    e.target.checked
                                )
                                setSearchParams((params) => {
                                    const newParams = new URLSearchParams(
                                        params
                                    )
                                    if (search) {
                                        newParams.set('search', search)
                                    } else {
                                        newParams.delete('search')
                                    }
                                    if (e.target.checked) {
                                        newParams.set('showBasePanels', 'true')
                                    } else {
                                        newParams.delete('showBasePanels')
                                    }
                                    return newParams
                                })
                            }}
                        />
                        <label>Show Base Panels</label>
                    </label>
                </div>
                <h2 className="text-center text-[1.8rem]">Panel Designs</h2>
                <table className="flex flex-col justify-center">
                    {filteredProjects.map((project) => (
                        <tr
                            key={project.id}
                            className={`flex flex-col justify-center border-b-2 border-solid border-black lg:flex-row`}
                        >
                            <td
                                className={`flex w-full flex-col p-2 lg:w-52 ${project.isLocal ? 'bg-teal-500 text-white' : ''} items-center justify-center`}
                            >
                                <div>
                                    {project.name}
                                    {project.isLocal ? '(Local)' : ''}
                                    <br />
                                    <br />
                                    {Math.trunc(
                                        project.layout.panelDimensions?.[0]
                                    )}
                                    mm X{' '}
                                    {Math.trunc(
                                        project.layout.panelDimensions?.[1]
                                    )}
                                    mm
                                </div>
                            </td>
                            <td className="p-8">
                                <div className="flex w-full flex-shrink flex-grow justify-center p-14">
                                    <LayoutDisplaySvg
                                        layout={project.layout}
                                        scale={1}
                                        hideButton={true}
                                        noArt={true}
                                    />
                                </div>
                            </td>
                            <td className="flex items-center justify-center gap-4">
                                <Link
                                    to={`/designer/projects/${project.id}${project.isLocal ? '?isLocal=true' : ''}`}
                                >
                                    <button className="h-20 bg-slate-500 p-4 text-white">
                                        Open
                                    </button>
                                </Link>
                                <button
                                    className="h-20 bg-slate-500 p-4 text-white"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/designer/projects/${project.id}`
                                        )
                                        toast.success('Copied URL to Clipboard')
                                    }}
                                >
                                    Share
                                </button>
                                <Link
                                    to={`/designer/projects/${project.id}?preview${project.isLocal ? '&isLocal=true' : ''}`}
                                >
                                    <button className="h-20 bg-slate-500 p-4 text-white">
                                        Test
                                    </button>
                                </Link>
                                {project.isLocal ? (
                                    <button
                                        className="bg-slate-500 p-4 text-white"
                                        onClick={() => {
                                            deleteProject(project.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                ) : null}
                            </td>
                        </tr>
                    ))}
                </table>
            </div>
            <div>
                <h2 className="text-center text-[1.8rem]">Custom Parts</h2>
                <table>
                    {filteredParts.map((part) => (
                        <tr
                            key={part.id}
                            className={`flex flex-col border-b-2 border-solid border-black lg:flex-row ${part.isLocal ? 'bg-lightblue' : ''} items-center justify-center`}
                        >
                            <td
                                className={`flex w-full flex-col p-2 lg:w-52 ${part.isLocal ? 'bg-teal-500 text-white' : ''} items-center justify-center`}
                            >
                                <div>
                                    {part.name}
                                    {part.isLocal ? '(Local)' : ''}
                                </div>
                            </td>
                            <td className="items-center justify-center p-8">
                                <div className="flex w-full flex-shrink flex-grow justify-center p-14">
                                    <LayoutDisplaySvg
                                        layout={part.layout}
                                        scale={1}
                                    />
                                </div>
                            </td>
                            <td className="flex items-center justify-center gap-4">
                                <Link
                                    to={`/designer/parts/${part.id}${part.isLocal ? '?isLocal' : ''}`}
                                >
                                    <button className="h-20 bg-slate-500 p-4 text-white">
                                        Open
                                    </button>
                                </Link>
                                <button
                                    className="h-20 bg-slate-500 p-4 text-white"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/designer/parts/${part.id}`
                                        )
                                    }}
                                >
                                    Share
                                </button>
                                <Link
                                    to={`/designer/parts/${part.id}?preview${part.isLocal ? '&isLocal' : ''}`}
                                >
                                    <button className="h-20 bg-slate-500 p-4 text-white">
                                        Test
                                    </button>
                                </Link>
                                {part.isLocal ? (
                                    <button
                                        className="h-20 bg-slate-500 p-4 text-white"
                                        onClick={() => {
                                            deletePart(part.id)
                                        }}
                                    >
                                        Delete
                                    </button>
                                ) : null}
                            </td>
                        </tr>
                    ))}
                </table>
            </div>
            <footer>© 2025 Michael C Main</footer>
        </div>
    )
}

export default ComponentManagerRoute
