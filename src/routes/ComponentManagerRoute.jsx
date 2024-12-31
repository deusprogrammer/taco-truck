import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutDisplaySvg from '../components/svg/LayoutDisplaySvg'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.config'

import config from '../../package.json'

const ComponentManagerRoute = () => {
    const [customParts] = useState([])
    const [panelDesigns] = useState([])
    const [combinedProjects, setCombinedProjects] = useState([])
    const [combinedParts, setCombinedParts] = useState([])

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

            const projects = projectsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            const components = componentsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))

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
                <h2 className="text-[1.8rem]">Panel Designs</h2>
                <table className="flex flex-col justify-center">
                    {combinedProjects.map((project) => (
                        <tr
                            key={project.id}
                            className={`flex flex-col justify-center border-b-2 border-solid border-black lg:flex-row`}
                        >
                            <td
                                className={`w-52 p-2 ${project.isLocal ? 'bg-teal-500 text-white' : ''}`}
                            >
                                {project.name}
                                {project.isLocal ? '(Local)' : ''}
                                <br />
                                <br />
                                {project.layout.panelDimensions?.[0]}mm X{' '}
                                {project.layout.panelDimensions?.[1]}mm
                            </td>
                            <td className="p-8">
                                <div className="flex w-full flex-shrink flex-grow justify-center p-14">
                                    <LayoutDisplaySvg
                                        layout={project.layout}
                                        scale={1}
                                    />
                                </div>
                            </td>
                            <td className="flex gap-4">
                                <Link
                                    to={`/designer/projects/${project.id}${project.isLocal ? '?isLocal=true' : ''}`}
                                >
                                    <button className="bg-slate-500 p-4 text-white">
                                        Edit
                                    </button>
                                </Link>
                                <Link
                                    to={`/designer/projects/${project.id}?preview${project.isLocal ? '&isLocal=true' : ''}`}
                                >
                                    <button className="bg-slate-500 p-4 text-white">
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
                <h2 className="text-[1.8rem]">Custom Parts</h2>
                <table>
                    {combinedParts.map((part) => (
                        <tr
                            key={part.id}
                            className={`flex flex-col border-b-2 border-solid border-black ${part.isLocal ? 'bg-lightblue' : ''}`}
                        >
                            <td
                                className={`w-16 p-2 ${part.isLocal ? 'bg-teal-500 text-white' : ''}`}
                            >
                                {part.name}
                                {part.isLocal ? '(Local)' : ''}
                            </td>
                            <td className="p-8">
                                <div className="flex w-full flex-shrink flex-grow justify-center p-14">
                                    <LayoutDisplaySvg
                                        layout={part.layout}
                                        scale={1}
                                    />
                                </div>
                            </td>
                            <td className="flex gap-4">
                                <Link
                                    to={`/designer/parts/${part.id}${part.isLocal ? '?isLocal' : ''}`}
                                >
                                    <button className="bg-slate-500 p-4 text-white">
                                        Edit
                                    </button>
                                </Link>
                                <Link
                                    to={`/designer/parts/${part.id}?preview${part.isLocal ? '&isLocal' : ''}`}
                                >
                                    <button className="bg-slate-500 p-4 text-white">
                                        Test
                                    </button>
                                </Link>
                                {part.isLocal ? (
                                    <button
                                        className="bg-slate-500 p-4 text-white"
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
        </div>
    )
}

export default ComponentManagerRoute
