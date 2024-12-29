import { useCallback, useEffect, useRef, useState } from 'react'

export const getMouseButtonsMap = (evt) => {
    return {
        left: !!(evt.buttons & 1),
        right: !!(evt.buttons & 2),
        middle: !!(evt.buttons & 4),
        back: !!(evt.buttons & 8),
        forward: !!(evt.buttons & 16),
    }
}

export const useMousePosition = (ref) => {
    const [status, setStatus] = useState({ x: 0, y: 0, buttons: null })

    const updateStatus = useCallback((evt) => {
        setStatus({ x: evt.offsetX, y: evt.offsetY, buttons: evt.buttons })
    }, [])

    useEffect(() => {
        if (!ref?.current) {
            return () => {}
        }

        const ele = ref.current
        ele.addEventListener('mousemove', updateStatus)
        return () => {
            ele.removeEventListener('mousemove', updateStatus)
        }
    }, [ref, updateStatus])

    return [status.x, status.y, status.buttons]
}

export const usePrevious = (value) => {
    const ref = useRef()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}

export const useButtonDown = () => {
    const [buttonsDown, setButtonsDown] = useState([])

    const onButtonDown = useCallback(
        ({ key }) => {
            if (!buttonsDown.includes(key)) {
                setButtonsDown([...buttonsDown, key])
            }
        },
        [buttonsDown]
    )

    const onButtonUp = useCallback(
        ({ key }) => {
            setButtonsDown(buttonsDown.filter((button) => key !== button))
        },
        [buttonsDown]
    )

    useEffect(() => {
        window.addEventListener('keydown', onButtonDown)
        window.addEventListener('keyup', onButtonUp)
        return () => {
            window.removeEventListener('keydown', onButtonDown)
            window.removeEventListener('keyup', onButtonUp)
        }
    }, [onButtonDown, onButtonUp])

    return buttonsDown
}

export const useMouseDrag = (ref, button) => {
    const [delta, setDelta] = useState({ x: 0, y: 0 })
    const dragStart = useRef(null)

    const updateStatus = useCallback(
        (evt) => {
            const buttonMap = getMouseButtonsMap(evt)

            if (!dragStart.current || !buttonMap[button]) {
                return
            }

            setDelta({
                x: dragStart.current[0] - evt.clientX,
                y: dragStart.current[1] - evt.clientY,
            })
        },
        [button]
    )

    const reset = useCallback(() => {
        dragStart.current = null
        setDelta({ x: 0, y: 0 })
    }, [])

    const clearDrag = useCallback(() => {
        dragStart.current = null
    }, [])

    const startDrag = useCallback((evt) => {
        dragStart.current = [evt.clientX, evt.clientY]
    }, [])

    useEffect(() => {
        if (!ref?.current) {
            return () => {}
        }

        const ele = ref.current
        ele.addEventListener('mousemove', updateStatus)
        ele.addEventListener('mousedown', startDrag)
        ele.addEventListener('mouseup', clearDrag)
        return () => {
            ele.removeEventListener('mousemove', updateStatus)
            ele.removeEventListener('mousedown', startDrag)
            ele.removeEventListener('mouseup', clearDrag)
        }
    }, [ref, updateStatus, startDrag, clearDrag])

    return [delta.x, delta.y, dragStart.current !== null, reset]
}

export const useViewportSize = () => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    const onResize = () => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return [dimensions.width, dimensions.height]
}

export const useContainerSize = (ref) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    const onResize = useCallback(() => {
        if (
            dimensions.width === ref.current.clientWidth &&
            dimensions.height === ref.current.clientHeight
        ) {
            return
        }

        setDimensions({
            width: ref.current.clientWidth,
            height: ref.current.clientHeight,
        })
    }, [ref])

    useEffect(() => {
        if (!ref?.current) {
            return () => {}
        }

        const ele = ref.current
        onResize()
        ele.addEventListener('resize', onResize)
        return () => {
            ele.removeEventListener('resize', onResize)
        }
    }, [ref, onResize])

    return [dimensions.width, dimensions.height]
}

export const usePixiContainerSize = (ref) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    const onResize = useCallback(() => {
        let bounds = ref.current?.getLocalBounds()

        if (!bounds) {
            return
        }

        if (
            !bounds ||
            (dimensions.width === bounds.width &&
                dimensions.height === bounds.height)
        ) {
            return
        }

        setDimensions({
            width: bounds.width,
            height: bounds.height,
        })
    }, [ref, dimensions.width, dimensions.height])

    useEffect(() => {
        if (!ref?.current) {
            return () => {}
        }

        onResize()
    }, [ref, onResize])

    return [dimensions.width, dimensions.height]
}

export const useRealScaleRatio = () => {
    const [screenHeight, setScreenHeight] = useState(0);
    const vRes = window.screen.availHeight

    useEffect(() => {
        let dataJSON = localStorage.getItem('screen-metrics')

        if (!dataJSON) {
            return () => {}
        }

        setScreenHeight(JSON.parse(dataJSON).screenHeight)
    }, [])

    if (!screenHeight) {
        return 0;
    }

    return vRes / screenHeight;
}