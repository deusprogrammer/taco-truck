import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import PartDesigner from '../components/PartDesigner';

const PartDesignerRoute = () => {
    const {type, id} = useParams();

    const [layout, setLayout] = useState(
        {
            units: "mm",
            panelDimensions: [0, 0],
            parts: []
        }
    );

    useEffect(() => {
        let dataJSON = localStorage.getItem("taco-truck-data");

        if (!dataJSON) {
            return;
        }

        const data = JSON.parse(dataJSON);

        switch(type) {
            case "projects": {
                const project = data.panelDesigns.find((design) => id === design.id);
                setLayout(project.layout);
                break;
            }
            case "parts": {
                const customPart = data.customParts.find((part) => id === part.id);
                setLayout(customPart.layout);
                break;
            } 
            default:
                break;
        }
    }, [type, id]);

    return (
        <div className="h-screen w-screen flex flex-column justify-center items-center">
            <PartDesigner 
                layout={layout}
                onLayoutChange={setLayout}
            />
        </div>
    )
}

export default PartDesignerRoute;