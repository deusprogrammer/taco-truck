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

import { usePartTable } from './hooks/PartTableHooks'
import Interstitial from './components/elements/Interstitial'

import 'react-toastify/dist/ReactToastify.css'
import './App.css'

const App = () => {
    const [securityContext, setSecurityContext] = useState()
    const { loadParts, loading } = usePartTable()

    useEffect(() => {
        const fetchSecurityContext = async () => {
            setSecurityContext(await getSecurityContext())
        }
        loadParts() // This triggers the data loading
        fetchSecurityContext()
    }, [loadParts])

    if (loading) {
        return (
            <Interstitial
                title="Loading Part Data..."
                message="Please wait while we fetch the latest parts information."
            />
        )
    }

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
