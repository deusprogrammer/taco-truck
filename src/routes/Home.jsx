import React from 'react'
import { Link } from 'react-router'

const Home = () => {
    return (
        <div className="flex flex-col gap-10 justify-center items-center">
            <h1 className="text-[2rem]">Project Taco Truck</h1>
            <Link className="text-[1.5rem] p-4" to={`/designer`}>
                Designer
            </Link>
            <Link className="text-[1.5rem] p-4" to={`/manager`}>
                Manager
            </Link>
        </div>
    )
}

export default Home
