import { useState } from 'react';
import PartDesigner from './components/PartDesigner'
import './App.css'

const App = () => {
    const [buttonLayout, setButtonLayout] = useState(
        {
            name: "sega-2p",
            units: "mm",
            panelDimensions: [0, 0],
            parts: [
                {
                     "id": "120b3d4e-e487-41f8-857a-124a011c806b",
                     "name": "LP",
                     "type": "button",
                     "position": [
                          0,
                          -39
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "8fe8d395-346a-49e7-9f2a-5e178e0c7c29"
                },
                {
                     "id": "19b6b683-9d44-4ac4-9332-f6cd407096a0",
                     "name": "MP",
                     "type": "button",
                     "position": [
                          32,
                          -18
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "120b3d4e-e487-41f8-857a-124a011c806b",
                     "dependents": [
                          "2b0a855f-b2ee-47a2-af42-37f9a1a74171"
                     ]
                },
                {
                     "id": "5980473f-2832-4030-9795-8dca01495b9a",
                     "name": "HP",
                     "type": "button",
                     "position": [
                          36,
                          0
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "19b6b683-9d44-4ac4-9332-f6cd407096a0",
                     "dependents": [
                          "e79fbf72-4dc6-4533-9290-8b9b9b1b9927"
                     ]
                },
                {
                     "id": "6c2953d4-4d7a-4450-8d78-b921f98e2a0b",
                     "name": "LT",
                     "type": "button",
                     "position": [
                          35,
                          9
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "5980473f-2832-4030-9795-8dca01495b9a",
                     "dependents": [
                          "00729184-7c5b-4d08-90e4-aaa906cbbc41"
                     ]
                },
                {
                     "id": "8fe8d395-346a-49e7-9f2a-5e178e0c7c29",
                     "name": "LK",
                     "type": "button",
                     "position": [
                          0,
                          0
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "dependents": [
                          "120b3d4e-e487-41f8-857a-124a011c806b"
                     ]
                },
                {
                     "id": "2b0a855f-b2ee-47a2-af42-37f9a1a74171",
                     "name": "MK",
                     "type": "button",
                     "position": [
                          0,
                          39
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "19b6b683-9d44-4ac4-9332-f6cd407096a0"
                },
                {
                     "id": "e79fbf72-4dc6-4533-9290-8b9b9b1b9927",
                     "name": "HK",
                     "type": "button",
                     "position": [
                          0,
                          39
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "5980473f-2832-4030-9795-8dca01495b9a"
                },
                {
                     "id": "00729184-7c5b-4d08-90e4-aaa906cbbc41",
                     "name": "RT",
                     "type": "button",
                     "position": [
                          0,
                          39
                     ],
                     "origin": [
                          0,
                          0
                     ],
                     "partId": "SANWA-24mm",
                     "relativeTo": "6c2953d4-4d7a-4450-8d78-b921f98e2a0b"
                }
            ]
        }
    );
    const [panelLayout, setPanelLayout] = useState(
        {
            units: "mm",
            panelDimensions: [280, 155],
            parts: [
                {
                    id: "hole1",
                    name: "M6-Hole",
                    type: "hole",
                    origin: [0, 0],
                    position: [15, 15],
                    partId: "M6"
                },
                {
                    id: "hole2",
                    name: "M6-Hole",
                    type: "hole",
                    origin: [0, 1],
                    position: [15, -15],
                    partId: "M6"
                },
                {
                    id: "hole3",
                    name: "M6-Hole",
                    type: "hole",
                    origin: [1, 0],
                    position: [-15, 15],
                    partId: "M6"
                },
                {
                    id: "hole4",
                    name: "M6-Hole",
                    type: "hole",
                    origin: [1, 1],
                    position: [-15, -15],
                    partId: "M6"
                },
                {
                    id: "hole5",
                    name: "M6-Hole",
                    type: "hole",
                    origin: [0.5, 0],
                    position: [0, 6],
                    partId: "M6"
                },
                {
                    id: "hole6",
                    name: "M6-Hole",
                    type: "hole",
                    origin: [0.5, 1],
                    position: [0, -6],
                    partId: "M6"
                },
                {
                    id: "sega2p-buttons",
                    name: "right-bb",
                    type: "custom",
                    origin: [0.5, 0.5],
                    position: [10, 10],
                    partId: "sega2p-buttons",
                    layout: buttonLayout
                }
            ]
        }
    );

    return (
        <div className="h-screen w-screen flex flex-column justify-center items-center">
            <PartDesigner 
                layout={panelLayout}
                onLayoutChange={setPanelLayout}
            />
        </div>
    )
}

export default App
