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

export const useContainerSize = (ref) => {
    const [dimensions, setDimensions] = useState({width: 0, height: 0});

    const onResize = useCallback(() => {
        if (dimensions.width === ref.current.clientWidth && dimensions.height === ref.current.clientHeight) {
            return;
        }

        setDimensions({
            width: ref.current.clientWidth, 
            height: ref.current.clientHeight
        });
    }, [ref]);

    useEffect(() => {
        if (!ref?.current) {
            return () => {};
        }

        const ele = ref.current;
        onResize();
        ele.addEventListener("resize", onResize);
        return () => {
            ele.removeEventListener("resize", onResize);
        }
    }, [ref, onResize]);

    return [dimensions.width, dimensions.height]
}