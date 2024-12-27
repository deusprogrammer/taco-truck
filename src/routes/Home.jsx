import React from 'react'
import { Link } from 'react-router'

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-10">
            <h1 className="text-[2rem]">Project Taco Truck</h1>
            <Link className="p-4 text-[1.5rem]" to={`/designer`}>
                Designer
            </Link>
            <Link className="p-4 text-[1.5rem]" to={`/manager`}>
                Manager
            </Link>
        </div>
    )
}

export default Home
