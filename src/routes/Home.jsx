import React from 'react'
import { Link } from 'react-router'
import config from '../../package.json'

const Home = () => {
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
            <footer>© 2025 Michael C Main</footer>
        </div>
    )
}

export default Home
