import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

const ComponentManagerRoute = () => {
    const [customParts, setCustomParts] = useState([]);
    const [panelDesigns, setPanelDesigns] = useState([]);

    useEffect(() => {
        let dataJSON = localStorage.getItem("taco-truck-data");

        if (!dataJSON) {
            return;
        }

        setCustomParts(JSON.parse(dataJSON).customParts);
        setPanelDesigns(JSON.parse(dataJSON).panelDesigns);
    }, []);

    const deleteProject = (idToDelete) => {
        const filtered = [...panelDesigns.filter(({id}) => id !== idToDelete)];
        setPanelDesigns(filtered);
        localStorage.setItem("taco-truck-data", JSON.stringify({
            panelDesigns, 
            customParts
        }));
    }

    const deletePart = (idToDelete) => {
        const filtered = [...customParts.filter(({id}) => id !== idToDelete)];
        setPanelDesigns(filtered);
        localStorage.setItem("taco-truck-data", JSON.stringify({
            panelDesigns, 
            customParts
        }));
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center">
            <h1 className='text-[2rem]'>Component Manager</h1>
            <div>
                <h2 className='text-[1.8rem]'>Panel Designs</h2>
                <ul className='flex flex-col gap-1 ml-4'>
                    {panelDesigns.map(({name, id}) => (
                        <li className='flex flex-row justify-between items-center'><Link to={`/designer/projects/${id}`}>{name}</Link><button className='bg-slate-500 text-white p-4' onClick={() => {deleteProject(id)}}>Delete</button></li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className='text-[1.8rem]'>Custom Parts</h2>
                <ul className='flex flex-col gap-1 ml-4'>
                    {customParts.map(({name, id}) => (
                        <li className='flex flex-row justify-between items-center'><Link to={`/designer/parts/${id}`}>{name}</Link><button className='bg-slate-500 text-white p-4' onClick={() => {deletePart(id)}}>Delete</button></li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default ComponentManagerRoute;