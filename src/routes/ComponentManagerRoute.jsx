import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import LayoutDisplaySvg from '../components/svg/LayoutDisplaySvg'

const ComponentManagerRoute = () => {
    const [customParts, setCustomParts] = useState([])
    const [panelDesigns, setPanelDesigns] = useState([])

    useEffect(() => {
        let dataJSON = localStorage.getItem('taco-truck-data')

        if (!dataJSON) {
            return
        }

        setCustomParts(JSON.parse(dataJSON).customParts)
        setPanelDesigns(JSON.parse(dataJSON).panelDesigns)
    }, [])

    const deleteProject = (idToDelete) => {
        const filtered = [...panelDesigns.filter(({ id }) => id !== idToDelete)]
        setPanelDesigns(filtered)
        localStorage.setItem(
            'taco-truck-data',
            JSON.stringify({
                panelDesigns: filtered,
                customParts,
            })
        )
    }

    const deletePart = (idToDelete) => {
        const filtered = [...customParts.filter(({ id }) => id !== idToDelete)]
        setCustomParts(filtered)
        localStorage.setItem(
            'taco-truck-data',
            JSON.stringify({
                panelDesigns,
                customParts: filtered,
            })
        )
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center">
            <h1 className="text-[2rem]">Component Manager</h1>
            <div>
                <h2 className="text-[1.8rem]">Panel Designs</h2>
                <table>
                    {panelDesigns.map((project) => (
                        <tr key={project.id}>
                            <td>{project.name}</td>
                            <td className="w-96">
                                <LayoutDisplaySvg
                                    hideButton={true}
                                    layout={project.layout}
                                />
                            </td>
                            <td className="flex gap-4">
                                <Link to={`/designer/projects/${project.id}`}>
                                    <button className="bg-slate-500 text-white p-4">
                                        Edit
                                    </button>
                                </Link>
                                <button
                                    className="bg-slate-500 text-white p-4"
                                    onClick={() => {
                                        deleteProject(project.id)
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </table>
            </div>
            <div>
                <h2 className="text-[1.8rem]">Custom Parts</h2>
                <table>
                    {customParts.map((part) => (
                        <tr key={part.id}>
                            <td>{part.name}</td>
                            <td className="w-96">
                                <LayoutDisplaySvg
                                    hideButton={true}
                                    layout={part.layout}
                                />
                            </td>
                            <td className="flex gap-4">
                                <Link to={`/designer/parts/${part.id}`}>
                                    <button className="bg-slate-500 text-white p-4">
                                        Edit
                                    </button>
                                </Link>
                                <button
                                    className="bg-slate-500 text-white p-4"
                                    onClick={() => {
                                        deletePart(part.id)
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </table>
            </div>
        </div>
    )
}

export default ComponentManagerRoute
