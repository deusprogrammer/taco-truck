import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import PartDesignerRoute from './routes/PartDesignerRoute'
import ComponentManagerRoute from './routes/ComponentManagerRoute'
import Calibration from './routes/Calibration'

import { ToastContainer } from 'react-toastify'
import { SecurityProvider } from './contexts/SecurityContext'
import { useEffect, useState } from 'react'
import { getSecurityContext } from './api/Api'
import Dev from './routes/Dev'
import ComplexPartDesigner from './routes/ComplexPartDesigner'

import 'react-toastify/dist/ReactToastify.css'
import './App.css'

const App = () => {
    const [securityContext, setSecurityContext] = useState()

    useEffect(() => {
        const fetchSecurityContext = async () => {
            setSecurityContext(await getSecurityContext())
        }

        fetchSecurityContext()
    }, [])

    return (
        <SecurityProvider value={securityContext}>
            <BrowserRouter basename="/taco-truck">
                <ToastContainer />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path={`/designer`} element={<PartDesignerRoute />} />
                    <Route
                        path={`/designer/complex-parts`}
                        element={<ComplexPartDesigner />}
                    />
                    <Route
                        path={`/designer/:type/:id`}
                        element={<PartDesignerRoute />}
                    />
                    <Route
                        path={`/manager`}
                        element={<ComponentManagerRoute />}
                    />
                    <Route path={`/calibration`} element={<Calibration />} />
                    {process.env.NODE_ENV === 'development' ? (
                        <Route exact path={`/dev`} element={<Dev />} />
                    ) : null}
                </Routes>
            </BrowserRouter>
        </SecurityProvider>
    )
}

export default App
