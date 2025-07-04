import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import PartDesignerRoute from './routes/PartDesignerRoute'
import ComponentManagerRoute from './routes/ComponentManagerRoute'
import Calibration from './routes/Calibration'
import PanelEditor from './routes/PanelEditor'
import './App.css'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
    return (
        <BrowserRouter>
            <ToastContainer />
            <Routes>
                <Route index element={<Home />} />
                <Route path={`/designer`} element={<PartDesignerRoute />} />
                <Route path={`/designer/panel`} element={<PanelEditor />} />
                <Route
                    path={`/designer/:type/:id`}
                    element={<PartDesignerRoute />}
                />
                <Route path={`/manager`} element={<ComponentManagerRoute />} />
                <Route path={`/calibration`} element={<Calibration />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
