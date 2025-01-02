import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './routes/Home'
import PartDesignerRoute from './routes/PartDesignerRoute'
import ComponentManagerRoute from './routes/ComponentManagerRoute'
import './App.css'
import { useEffect } from 'react'

const App = () => {
    useEffect(() => {
        // Prevent overscroll
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'

        // Prevent overscroll on iOS
        const preventOverscroll = (event) => {
            if (event.touches.length > 1) {
                event.preventDefault()
            }
        }

        document.addEventListener('touchmove', preventOverscroll, {
            passive: false,
        })

        return () => {
            // Clean up the styles and event listener when the component unmounts
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
            document.removeEventListener('touchmove', preventOverscroll)
        }
    }, [])

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
