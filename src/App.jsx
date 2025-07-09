import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import PartDesignerRoute from './routes/PartDesignerRoute'
import ComponentManagerRoute from './routes/ComponentManagerRoute'
import Calibration from './routes/Calibration'
import PanelEditor from './routes/PanelEditor'
import './App.css'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SecurityProvider } from './contexts/SecurityContext'
import { useEffect, useState } from 'react'
import { getSecurityContext } from './api/Api'

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
                    <Route path={`/designer/panel`} element={<PanelEditor />} />
                    <Route
                        path={`/designer/:type/:id`}
                        element={<PartDesignerRoute />}
                    />
                    <Route
                        path={`/manager`}
                        element={<ComponentManagerRoute />}
                    />
                    <Route path={`/calibration`} element={<Calibration />} />
                </Routes>
            </BrowserRouter>
        </SecurityProvider>
    )
}

export default App
