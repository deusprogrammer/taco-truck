import React from 'react'
import { Link } from 'react-router'
import config from '../../package.json'
import { login } from '../components/utils'
import { useSecurity } from '../contexts/SecurityContext'

const Home = () => {
    const securityContext = useSecurity()

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-10 bg-slate-600 text-white">
            <img
                className="w-[200px]"
                alt="logo"
                src={`${process.env.PUBLIC_URL}/logo.png`}
            />
            <h1 className="text-[2rem]">
                Project Taco Truck v{config.version}
            </h1>
            <Link className="p-4 text-[1.5rem]" to={`/designer`}>
                Designer
            </Link>
            <Link className="p-4 text-[1.5rem]" to={`/manager`}>
                Manager
            </Link>
            {securityContext ? (
                <div>Welcome back ${securityContext.username}</div>
            ) : (
                <button className="p-4 text-[1.5rem]" onClick={login}>
                    Login
                </button>
            )}
            <footer>© 2025 Michael C Main</footer>
        </div>
    )
}

export default Home
