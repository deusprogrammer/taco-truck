import React, { useState } from 'react'
import { Link } from 'react-router'
import config from '../../package.json'
import { login } from '../components/utils'
import { useSecurity } from '../contexts/SecurityContext'
import AboutModal from '../components/menus/About'

const Home = () => {
    const securityContext = useSecurity()
    const [aboutOpen, setAboutOpen] = useState(false)

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-1 bg-slate-600 text-white">
            <img
                className="w-[500px]"
                alt="logo"
                src={`${process.env.PUBLIC_URL}/bgg-logo.png`}
            />
            <h1 className="text-[2rem]">
                Project Taco Truck v{config.version}
            </h1>

            <h2 className="text-[1.5rem]">Design</h2>
            <Link
                className="bg-slate-500 p-2 hover:bg-slate-800"
                to={`/designer`}
            >
                Project/Layout Designer
            </Link>
            <Link
                className="bg-slate-500 p-2 hover:bg-slate-800"
                to={`/designer/complex-parts`}
            >
                Part Designer
            </Link>

            <h2 className="text-[1.5rem]">Browse</h2>
            <Link
                className="bg-slate-500 p-2 hover:bg-slate-800"
                to={`/manager`}
            >
                Project/Layout List
            </Link>

            <h2 className="text-[1.5rem]">User</h2>
            {securityContext ? (
                <div>Welcome back {securityContext.username}</div>
            ) : (
                <button
                    className="bg-slate-500 p-2 hover:bg-slate-800"
                    onClick={login}
                >
                    Login
                </button>
            )}

            <h2 className="text-[1.5rem]">About</h2>
            <button
                className="bg-slate-500 p-2 hover:bg-slate-800"
                onClick={() => setAboutOpen(true)}
            >
                About
            </button>
            <button
                onClick={() =>
                    window.open('https://ko-fi.com/michaelcmain52278')
                }
                className="bg-slate-500 p-2 hover:bg-slate-800"
            >
                Donate =3
            </button>
            <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

            <footer>© 2025 Michael C Main</footer>
        </div>
    )
}

export default Home
