import { useAtom } from "jotai"
import { useCallback, useEffect } from "react"
import { buttonOpacityAtom, editLockComponentAtom, mappingStyleAtom, modeAtom, previewAtom, screenSizeAtom, scrollLockComponentAtom, selectedAtom, workspacePositionAtom, zoomAtom, zoomLockComponentAtom } from "../atoms/ViewOptions.atom"
import { useContainerSize, useRealScaleRatio } from "./MouseHooks"
import { calculateSizeOfPart } from "../components/utils"
import { usePartTable } from "./PartTableHooks"

export const useKeyShortcuts = ({ layout, containerRef }) => {
    const {partTable} = usePartTable()
    const [partsWidth, partsHeight] = calculateSizeOfPart({
            type: 'custom',
            layout: layout,
    }, partTable)
    
    const [width, height] = useContainerSize(containerRef)

    const realSizeRatio = useRealScaleRatio()
    const [, setWorkspacePosition] = useAtom(
        workspacePositionAtom
    )
    const [, setScreenSize] = useAtom(screenSizeAtom)
    const [zoom, setZoom] = useAtom(zoomAtom)
    const [, setMode] = useAtom(modeAtom)

    const [editLock, setEditLock] = useAtom(editLockComponentAtom)
    const [scrollLock, setScrollLock] = useAtom(scrollLockComponentAtom)
    const [zoomLock, setZoomLock] = useAtom(zoomLockComponentAtom)
    const [preview, setPreview] = useAtom(previewAtom)
    const [buttonOpacity, setButtonOpacity] = useAtom(buttonOpacityAtom)
    const [, setSelected] = useAtom(selectedAtom)
    const [mappingStyle, setMappingStyle] = useAtom(mappingStyleAtom)

    const centerWorkPiece = useCallback(() => {
        setScreenSize([window.innerWidth, window.innerHeight])

        let contextWidth = partsWidth
        let contextHeight = partsHeight
        if (layout.panelDimensions[0]) {
            contextWidth = layout.panelDimensions[0]
        }

        if (layout.panelDimensions[1]) {
            contextHeight = layout.panelDimensions[1]
        }

        console.log(`${contextWidth} x ${contextHeight}`)

        if (width > 0 && height > 0) {
            setWorkspacePosition([
                width / 2 - (contextWidth / 2) * zoom,
                height / 2 - (contextHeight / 2) * zoom,
            ])
        }
    }, [
        width,
        height,
        zoom,
        layout.panelDimensions,
        partsHeight,
        partsWidth,
        setWorkspacePosition,
        setScreenSize,
    ])

    const onKeyDown = useCallback(
            (evt) => {
                if (evt.key === 'Escape') {
                    setSelected(null)
                    setMode(null)
                } else if (evt.key === 'c') {
                    centerWorkPiece()
                } else if (evt.key === 'p') {
                    setPreview(!preview)
                } else if (evt.key === '1') {
                    setEditLock(!editLock)
                } else if (evt.key === '2') {
                    setScrollLock(!scrollLock)
                } else if (evt.key === '3') {
                    setZoomLock(!zoomLock)
                } else if (evt.key === '4') {
                    if (buttonOpacity === 0.5) {
                        setButtonOpacity(1)
                    } else {
                        setButtonOpacity(0.5)
                    }
                } else if (evt.key === 'r') {
                    setZoom(realSizeRatio)
                } else if (evt.key === 'q') {
                    !zoomLock && setZoom(Math.max(zoom - 0.2, 0.1))
                } else if (evt.key === 'e') {
                    !zoomLock && setZoom(zoom + 0.2)
                } else if (evt.key === 'w') {
                    !scrollLock &&
                        setWorkspacePosition((old) => [
                            old[0],
                            old[1] - 8 * zoom,
                        ])
                } else if (evt.key === 's') {
                    !scrollLock &&
                        setWorkspacePosition((old) => [
                            old[0],
                            old[1] + 8 * zoom,
                        ])
                } else if (evt.key === 'a') {
                    !scrollLock &&
                        setWorkspacePosition((old) => [
                            old[0] - 8 * zoom,
                            old[1],
                        ])
                } else if (evt.key === 'd') {
                    !scrollLock &&
                        setWorkspacePosition((old) => [
                            old[0] + 8 * zoom,
                            old[1],
                        ])
                } else if (evt.key === 'm') {
                    if (mappingStyle === 'PS') {
                        setMappingStyle('XB')
                    } else if (mappingStyle === 'XB') {
                        setMappingStyle('NS')
                    } else {
                        setMappingStyle('PS')
                    }
                }
            },
            [setSelected, setMode, centerWorkPiece, setPreview, preview, setEditLock, editLock, setScrollLock, scrollLock, setZoomLock, zoomLock, buttonOpacity, setButtonOpacity, setZoom, realSizeRatio, zoom, setWorkspacePosition, mappingStyle, setMappingStyle]
    )
    
    useEffect(() => {
            window.addEventListener('keydown', onKeyDown)
            return () => {
                window.removeEventListener('keydown', onKeyDown)
            }
        }, [onKeyDown])
}