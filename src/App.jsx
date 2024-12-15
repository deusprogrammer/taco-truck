import { useState } from 'react';
import PartDesigner from './components/PartDesigner'
import './App.css'

const App = () => {
    const [layout, setLayout] = useState(
        {
            
            units: "mm",
            panelDimensions: [0, 0],
            parts: []
        }
    );


    return (
        <div className="h-screen w-screen flex flex-column justify-center items-center">
            <PartDesigner 
                layout={layout}
                onLayoutChange={setLayout}
            />
        </div>
    )
}

export default App
