import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LayoutDisplaySvg from '../components/svg/LayoutDisplaySvg'

import config from '../../package.json'
import { toast } from 'react-toastify'
import {
    getComponents,
    getProjects,
    deleteProject as deleteCloudProject,
    deleteComponent as deleteCloudPart,
} from '../api/Api'
import { useSecurity } from '../contexts/SecurityContext'

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

    const securityContext = useSecurity()

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
            const projectsSnapshot = await getProjects()
            const componentsSnapshot = await getComponents()

            const projects = projectsSnapshot.map((doc) => {
                return { id: doc._id, ...doc }
            })
            const components = componentsSnapshot.map((doc) => {
                return { id: doc._id, ...doc }
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
                const areaA = a.panelDimensions?.[0] * a.panelDimensions?.[1]
                const areaB = b.panelDimensions?.[0] * b.panelDimensions?.[1]
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
        const found = combinedProjects.find(({ id }) => id === idToDelete)

        if (!found) {
            throw new Error('Could not find project to delete')
        }

        // If not local, try calling api to delete
        if (!found.isLocal) {
            deleteCloudProject(idToDelete)
        }

        // Filter projects
        const filtered = [
            ...combinedProjects.filter(({ id }) => id !== idToDelete),
        ]
        setCombinedProjects(filtered)

        // If local, store it back to local storage
        if (found.isLocal) {
            localStorage.setItem(
                'taco-truck-data',
                JSON.stringify({
                    panelDesigns: filtered.filter((project) => project.isLocal),
                    customParts,
                })
            )
        }
    }

    const deletePart = (idToDelete) => {
        const found = combinedParts.find(({ id }) => id === idToDelete)

        if (!found) {
            throw new Error('Could not find part to delete')
        }

        const filtered = [
            ...combinedParts.filter(({ id }) => id !== idToDelete),
        ]
        setCombinedParts(filtered)

        if (found.isLocal) {
            localStorage.setItem(
                'taco-truck-data',
                JSON.stringify({
                    panelDesigns,
                    customParts: filtered.filter((part) => part.isLocal),
                })
            )
        } else {
            deleteCloudPart(idToDelete)
        }
    }

    // Helper to get a value from an object using a path like "layout.panelDimensions[0]"
    function getValueByPath(obj, path) {
        if (!obj || !path) return undefined
        // Split by . and handle [index]
        const parts = path.split('.').flatMap((part) => {
            const matches = [...part.matchAll(/([^\[\]]+)|\[(\d+)\]/g)]
            return matches.map((m) =>
                m[1] !== undefined ? m[1] : Number(m[2])
            )
        })
        return parts.reduce(
            (acc, key) => (acc != null ? acc[key] : undefined),
            obj
        )
    }

    // Enhanced multi-field search logic with path support
    const fieldRegex = /([\w.\[\]]+):([^\s]+)/g
    let fieldSearches = {}
    let nameSearch = search

    // Extract all field:value pairs
    let match
    while ((match = fieldRegex.exec(search)) !== null) {
        fieldSearches[match[1]] = match[2].toLowerCase()
        nameSearch = nameSearch.replace(match[0], '').trim()
    }

    // Helper to check if an object matches all fieldSearches (with path support)
    const matchesFields = (obj) => {
        return Object.entries(fieldSearches).every(([field, value]) => {
            const fieldVal = getValueByPath(obj, field)
            return fieldVal !== undefined && fieldVal !== null
                ? fieldVal.toString().toLowerCase().includes(value)
                : false
        })
    }

    let filteredProjects = combinedProjects.filter((project) => {
        const matchesField = matchesFields(project)
        const matchesName = nameSearch
            ? (project.name || '')
                  .toLowerCase()
                  .includes(nameSearch.toLowerCase())
            : true
        return matchesField && matchesName
    })

    const filteredParts = combinedParts.filter((part) => {
        const matchesField = matchesFields(part)
        const matchesName = nameSearch
            ? (part.name || '').toLowerCase().includes(nameSearch.toLowerCase())
            : true
        return matchesField && matchesName
    })

    // Add filter for panels with no buttons or custom parts
    if (showPanelsWithoutButtonsOrParts) {
        filteredProjects = filteredProjects.filter((project) => {
            // If there are no parts, or all parts are type 'hole', keep it
            const parts = project?.parts || []
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
                        placeholder="Search by name or by field (i.e. owner:anonymous)..."
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
                        className="w-[80%] rounded p-2 text-black"
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
                <table className="flex w-full flex-col justify-center">
                    {filteredProjects.map((project) => (
                        <tr
                            key={project.id}
                            className={`flex flex-col justify-center border-b-2 border-solid border-black lg:flex-row lg:justify-between`}
                        >
                            <td
                                className={`flex w-full flex-col p-2 lg:w-52 ${project.isLocal ? 'bg-teal-500 text-white' : ''} items-center justify-center`}
                            >
                                <div>
                                    {project.name}
                                    {project.isLocal ? '(Local)' : ''}
                                    <br />
                                    <br />
                                    {Math.trunc(project.panelDimensions?.[0])}
                                    mm X{' '}
                                    {Math.trunc(project.panelDimensions?.[1])}
                                    mm
                                    <br />
                                    <br />
                                    Created by {project.owner}
                                </div>
                            </td>
                            <td className="p-8">
                                <div className="flex w-full flex-shrink flex-grow justify-center p-14">
                                    <LayoutDisplaySvg
                                        layout={project}
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
                                <button
                                    className="h-20 bg-slate-500 p-4 text-white"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `https://deusprogrammer.com/api/taco-truck/projects/${project.id}/file.png`
                                        )
                                        toast.success('Copied URL to Clipboard')
                                    }}
                                >
                                    Get Image Link
                                </button>
                                <Link
                                    to={`/designer/projects/${project.id}?preview${project.isLocal ? '&isLocal=true' : ''}`}
                                >
                                    <button className="h-20 bg-slate-500 p-4 text-white">
                                        Test
                                    </button>
                                </Link>
                                {project.isLocal ||
                                securityContext?.roles?.includes(
                                    'TACO_TRUCK_ADMIN'
                                ) ||
                                securityContext?.username === project.owner ? (
                                    <button
                                        className="h-20 bg-slate-500 p-4 text-white"
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
            <div className="mx-auto flex w-[90%] flex-col justify-center">
                <h2 className="text-center text-[1.8rem]">Custom Parts</h2>
                <table className="flex w-full flex-col justify-center">
                    {filteredParts.map((part) => (
                        <tr
                            key={part.id}
                            className={`flex flex-col border-b-2 border-solid border-black lg:flex-row lg:justify-between ${part.isLocal ? 'bg-lightblue' : ''} items-center justify-center`}
                        >
                            <td
                                className={`flex w-full flex-col p-2 lg:w-52 ${part.isLocal ? 'bg-teal-500 text-white' : ''} items-center justify-center`}
                            >
                                <div>
                                    {part.name}
                                    {part.isLocal ? '(Local)' : ''}
                                    <br />
                                    <br />
                                    Created by {part.owner}
                                </div>
                            </td>
                            <td className="items-center justify-center p-8">
                                <div className="flex w-full flex-shrink flex-grow justify-center p-14">
                                    <LayoutDisplaySvg layout={part} scale={1} />
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
                                <button
                                    className="h-20 bg-slate-500 p-4 text-white"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `https://deusprogrammer.com/api/taco-truck/components/${part.id}/file.png`
                                        )
                                        toast.success('Copied URL to Clipboard')
                                    }}
                                >
                                    Get Image Link
                                </button>
                                <Link
                                    to={`/designer/parts/${part.id}?preview${part.isLocal ? '&isLocal' : ''}`}
                                >
                                    <button className="h-20 bg-slate-500 p-4 text-white">
                                        Test
                                    </button>
                                </Link>
                                {part.isLocal ||
                                securityContext?.roles?.includes(
                                    'TACO_TRUCK_ADMIN'
                                ) ||
                                securityContext?.username === part.owner ? (
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
