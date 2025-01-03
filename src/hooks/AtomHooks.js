import { useAtom } from "jotai"
import { useCallback, useEffect } from "react"
import { buttonOpacityAtom, editLockComponentAtom, modeAtom, previewAtom, scrollLockComponentAtom, selectedAtom, workspacePositionAtom, zoomAtom, zoomLockComponentAtom } from "../atoms/ViewOptions.atom"
import { ADD, SELECT } from "../components/elements/Modes"
import { useContainerSize, useRealScaleRatio } from "./MouseHooks"
import { calculateSizeOfPart } from "../components/utils"

export const useKeyShortcuts = ({layout, containerRef}) => {
    const [partsWidth, partsHeight] = calculateSizeOfPart({
            type: 'custom',
            layout: layout,
    })
    
    const [width, height] = useContainerSize(containerRef)

    const realSizeRatio = useRealScaleRatio()
    const [, setWorkspacePosition] = useAtom(
        workspacePositionAtom
    )
    const [zoom, setZoom] = useAtom(zoomAtom)
    const [mode, setMode] = useAtom(modeAtom)

    const [editLock, setEditLock] = useAtom(editLockComponentAtom)
    const [scrollLock, setScrollLock] = useAtom(scrollLockComponentAtom)
    const [zoomLock, setZoomLock] = useAtom(zoomLockComponentAtom)
    const [preview, setPreview] = useAtom(previewAtom)
    const [buttonOpacity, setButtonOpacity] = useAtom(buttonOpacityAtom)
    const [, setSelected] = useAtom(selectedAtom)

    const centerWorkPiece = useCallback(() => {
        if (
            (layout.panelDimensions[0] > 0 && layout.panelDimensions[1] > 0) ||
            layout.parts.length > 0
        ) {
            setWorkspacePosition([
                width / 2 -
                    (Math.min(
                        partsWidth,
                        layout.panelDimensions[0] || partsWidth
                    ) /
                        2) *
                        zoom,
                height / 2 -
                    (Math.min(
                        partsHeight,
                        layout.panelDimensions[1] || partsHeight
                    ) /
                        2) *
                        zoom,
            ])
        }
    }, [
        height,
        layout.panelDimensions,
        layout.parts.length,
        partsHeight,
        partsWidth,
        setWorkspacePosition,
        width,
        zoom,
    ])

    const onKeyDown = useCallback(
            (evt) => {
                if (evt.key === 'Escape') {
                    if (mode === SELECT) {
                        setSelected(null)
                    } else if (mode === ADD) {
                        setMode(SELECT)
                    }
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
                }
            },
            [mode, setSelected, setMode, centerWorkPiece, setPreview, preview, setEditLock, editLock, setScrollLock, scrollLock, setZoomLock, zoomLock, buttonOpacity, setButtonOpacity, setZoom, realSizeRatio, zoom, setWorkspacePosition]
    )
    
    useEffect(() => {
            window.addEventListener('keydown', onKeyDown)
            return () => {
                window.removeEventListener('keydown', onKeyDown)
            }
        }, [onKeyDown])
}