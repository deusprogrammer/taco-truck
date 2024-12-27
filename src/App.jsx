import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import PartDesignerRoute from './routes/PartDesignerRoute'
import ComponentManagerRoute from './routes/ComponentManagerRoute'
import './App.css'
import { useEffect } from 'react'

const App = () => {
    useEffect(() => {}, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path={`/designer`} element={<PartDesignerRoute />} />
                <Route
                    path={`/designer/:type/:id`}
                    element={<PartDesignerRoute />}
                />
                <Route path={`/manager`} element={<ComponentManagerRoute />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
