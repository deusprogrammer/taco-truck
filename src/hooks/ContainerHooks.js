import { useEffect, useState } from 'react'

export const useResize = () => {
    const [height, setHeight] = useState(0)
    const [top, setTop] = useState(0)

    const handleResize = () => {
        const top = document.getElementById('menu-top')
        const bottom = document.getElementById('menu-bottom')

        const newMenuHeight =
            window.innerHeight - (top.clientHeight + bottom.clientHeight)
        const newMenuTop = top.clientTop + top.clientHeight
        setHeight(newMenuHeight - 10)
        setTop(newMenuTop)
    }

    useEffect(() => {
            const top = document.getElementById('menu-top')
            const bottom = document.getElementById('menu-bottom')
    
            handleResize()
    
            const resizeObserver = new ResizeObserver(() => {
                handleResize()
            })
    
            resizeObserver.observe(top)
            resizeObserver.observe(bottom)
            window.addEventListener('resize', handleResize)
            return () => {
                resizeObserver.unobserve(top)
                resizeObserver.unobserve(bottom)
                resizeObserver.disconnect()
                window.removeEventListener('resize', handleResize)
            }
    }, [])
    
    return () => ({
        style: {
            top,
            height
        }
    })
}