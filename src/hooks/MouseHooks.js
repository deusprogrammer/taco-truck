import { useCallback, useEffect, useRef, useState } from "react";

export const useMousePosition = (ref) => {
    const [status, setStatus] = useState({x: 0, y: 0, buttons: null});

    const updateStatus = useCallback((evt) => {
        setStatus({x: evt.offsetX, y: evt.offsetY, buttons: evt.buttons});
    }, []);

    useEffect(() => {
        if (!ref?.current) {
            return () => {}
        }

        const ele = ref.current;
        ele.addEventListener('mousemove', updateStatus);
        return () => {
            ele.removeEventListener('mousemove', updateStatus);
        }
    }, [ref, updateStatus]);

    return [status.x, status.y, status.buttons];
}

export const useMouseDrag = (ref) => {
    const [delta, setDelta] = useState({x: 0, y: 0});
    const dragStart = useRef(null);

    const updateStatus = useCallback((evt) => {
        if (!dragStart.current) {
            return;
        }

        setDelta({x: dragStart.current[0] - evt.clientX, y: dragStart.current[1] - evt.clientY});
    }, []);

    const clearDrag = useCallback(() => {
        dragStart.current = null;
    }, []);

    const startDrag = useCallback((evt) => {
        dragStart.current = [evt.clientX, evt.clientY];
    }, []);

    useEffect(() => {
        if (!ref?.current) {
            return () => {}
        }
        
        const ele = ref.current;
        ele.addEventListener('mousemove', updateStatus);
        ele.addEventListener('mousedown', startDrag);
        ele.addEventListener('mouseup', clearDrag);
        return () => {
            ele.removeEventListener('mousemove', updateStatus);
            ele.removeEventListener('mousedown', startDrag);
            ele.removeEventListener('mouseup', clearDrag);
        }
    }, [ref, updateStatus, startDrag, clearDrag]);

    return [delta.x, delta.y, dragStart.current === null];
}

export const useViewportSize = () => {
    const [dimensions, setDimensions] = useState({width: window.innerWidth, height: window.innerHeight});

    const onResize = () => {
        setDimensions({
            width: window.innerWidth, 
            height: window.innerHeight
        });
    }

    useEffect(() => {
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        }
    }, []);

    return [dimensions.width, dimensions.height]
}

export const useContainerSize = ({element}) => {
    const [dimensions, setDimensions] = useState({width: window.innerWidth, height: window.innerHeight});

    const onResize = useCallback(() => {
        setDimensions({
            width: element.current.clientWidth, 
            height: element.current.clientHeight
        });
    }, [element]);

    useEffect(() => {
        if (!element?.current) {
            return () => {};
        }

        const ele = element.current;

        ele.addEventListener("resize", onResize);
        return () => {
            ele.removeEventListener("resize", onResize);
        }
    }, [element, onResize]);

    return [dimensions.width, dimensions.height]
}