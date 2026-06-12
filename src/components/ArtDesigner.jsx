import React, {
    createRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { useGesture } from '@use-gesture/react'
import { ART_ADJUST } from './elements/Modes'
import LayoutDisplay from './LayoutDisplay'
import { closeModal, openModal } from './modals/ModalContainer'
import { calculateSizeOfPart, simplify, login } from './utils'
import { CIRCLE, SQUARE } from '../data/parts.table'
import { convertPathToInstructions } from './svg-utils'
import { useContainerSize, useRealScaleRatio } from '../hooks/MouseHooks'
import {
    editLockComponentAtom,
    previewAtom,
    screenSizeAtom,
    scrollLockComponentAtom,
    selectedAtom,
    workspacePositionAtom,
    zoomAtom,
    zoomLockComponentAtom,
} from '../atoms/ViewOptions.atom'
import { useAtom } from 'jotai'
import { GenericButton, LockToggleButton, ZoomButton } from './elements/Buttons'
import { useSecurity } from '../contexts/SecurityContext'
import { usePartTable } from '../hooks/PartTableHooks'

const SCALE_RATIO = 1000

const ArtDesigner = ({
    layout,
    preview: previewOverride,
    isNew,
    onLayoutChange,
}) => {
    const containerRef = createRef()
    const fileInputRef = useRef()
    const { partTable } = usePartTable()

    const [artDataUri, setArtDataUri] = useState(null)
    const [artMasked, setArtMasked] = useState(false)

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (evt) => setArtDataUri(evt.target.result)
        reader.readAsDataURL(file)
    }, [])

    const handleSavePng = useCallback(() => {
        if (!artDataUri || !layout?.panelDimensions) return
        const img = new window.Image()
        img.onload = () => {
            const panelW = layout.panelDimensions[0]
            const panelH = layout.panelDimensions[1]
            const artworkZoom = layout.artworkZoom || 1
            const [offsetX, offsetY] = layout.artworkOffset || [0, 0]
            const cornerRadius = layout.cornerRadius || 0

            // exportScale makes 1 image pixel = 1 canvas pixel
            const exportScale = 1 / artworkZoom
            const canvasW = Math.round(panelW * exportScale)
            const canvasH = Math.round(panelH * exportScale)

            const canvas = document.createElement('canvas')
            canvas.width = canvasW
            canvas.height = canvasH
            const ctx = canvas.getContext('2d')

            // Clip to panel rounded-rect shape
            const r = cornerRadius * exportScale
            ctx.beginPath()
            ctx.moveTo(r, 0)
            ctx.lineTo(canvasW - r, 0)
            ctx.arcTo(canvasW, 0, canvasW, r, r)
            ctx.lineTo(canvasW, canvasH - r)
            ctx.arcTo(canvasW, canvasH, canvasW - r, canvasH, r)
            ctx.lineTo(r, canvasH)
            ctx.arcTo(0, canvasH, 0, canvasH - r, r)
            ctx.lineTo(0, r)
            ctx.arcTo(0, 0, r, 0, r)
            ctx.closePath()
            ctx.clip()

            // Draw artwork at native resolution
            ctx.drawImage(
                img,
                offsetX * exportScale,
                offsetY * exportScale,
                img.naturalWidth,
                img.naturalHeight
            )

            // Collect all primitive parts (buttons/holes) via simplify, which resolves
            // positions through custom/nested parts and gives a panelPosition.
            const collectPrimitives = (node) => {
                if (!node) return []
                if (node.type === 'button' || node.type === 'hole')
                    return [node]
                return (node.children || []).flatMap(collectPrimitives)
            }
            const collectUserParts = (node) => {
                if (!node) return []
                if (node.type === 'user' && node.modelTree) return [node]
                return (node.children || []).flatMap(collectUserParts)
            }

            // Recursively draw a modelTree node onto a Canvas 2D context.
            // Coordinates in the modelTree are in mm; caller must set up ctx scale.
            const drawModelTreeOnCanvas = (ctx2, node) => {
                if (!node || node.graphical) return
                const {
                    type,
                    d,
                    cx,
                    cy,
                    r,
                    rx,
                    ry,
                    x,
                    y,
                    width: w,
                    height: h,
                    children,
                    transform,
                    points,
                } = node
                ctx2.save()
                if (transform?.translate) {
                    ctx2.translate(
                        transform.translate.x || 0,
                        transform.translate.y || 0
                    )
                }
                if (transform?.scale) {
                    ctx2.scale(transform.scale.x || 1, transform.scale.y || 1)
                }
                if (transform?.rotate) {
                    ctx2.rotate((transform.rotate * Math.PI) / 180)
                }
                if (type === 'path' && d) {
                    const instr = convertPathToInstructions(
                        d.replace(/(?<![eE])-/g, ' -')
                    )
                    if (instr) {
                        ctx2.beginPath()
                        let subpathStart = null
                        instr.forEach(({ type: t, point, points: pts }) => {
                            if (t === 'move') {
                                ctx2.moveTo(point[0], point[1])
                                subpathStart = point
                            } else if (t === 'line') {
                                ctx2.lineTo(point[0], point[1])
                            } else if (t === 'bezier' && pts?.length >= 3) {
                                ctx2.bezierCurveTo(
                                    pts[0][0],
                                    pts[0][1],
                                    pts[1][0],
                                    pts[1][1],
                                    pts[2][0],
                                    pts[2][1]
                                )
                            } else if (t === 'quadratic' && pts?.length >= 2) {
                                ctx2.quadraticCurveTo(
                                    pts[0][0],
                                    pts[0][1],
                                    pts[1][0],
                                    pts[1][1]
                                )
                            } else if (t === 'close' && subpathStart) {
                                ctx2.closePath()
                            }
                        })
                        ctx2.fill()
                    }
                } else if (type === 'circle') {
                    ctx2.beginPath()
                    ctx2.arc(cx, cy, r, 0, Math.PI * 2)
                    ctx2.fill()
                } else if (type === 'ellipse') {
                    ctx2.beginPath()
                    ctx2.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
                    ctx2.fill()
                } else if (type === 'rectangle') {
                    ctx2.beginPath()
                    ctx2.rect(x, y, w, h)
                    ctx2.fill()
                } else if (type === 'polygon' && points?.length) {
                    ctx2.beginPath()
                    ctx2.moveTo(points[0][0], points[0][1])
                    points
                        .slice(1)
                        .forEach(([px2, py2]) => ctx2.lineTo(px2, py2))
                    ctx2.closePath()
                    ctx2.fill()
                }
                ;(children || []).forEach((child) =>
                    drawModelTreeOnCanvas(ctx2, child)
                )
                ctx2.restore()
            }

            const simplified = simplify(layout, null, partTable)
            const primitives = collectPrimitives(simplified)
            const userParts = collectUserParts(simplified)

            // Punch transparent holes for every button and hole part
            ctx.globalCompositeOperation = 'destination-out'
            primitives.forEach((part) => {
                const def = partTable[part.type]?.[part.partId]
                if (!def) return
                const [px, py] = part.panelPosition || part.position || [0, 0]
                const { shape, size } = def
                ctx.beginPath()
                if (shape === CIRCLE) {
                    ctx.arc(
                        px * exportScale,
                        py * exportScale,
                        (size / 2) * exportScale,
                        0,
                        Math.PI * 2
                    )
                } else if (shape === SQUARE) {
                    const [sw, sh] = Array.isArray(size) ? size : [size, size]
                    ctx.rect(
                        (px - sw / 2) * exportScale,
                        (py - sh / 2) * exportScale,
                        sw * exportScale,
                        sh * exportScale
                    )
                }
                ctx.fill()
            })

            // Punch transparent cutouts for user/SVG (complex) parts
            userParts.forEach((part) => {
                const [px, py] = part.panelPosition || part.position || [0, 0]
                ctx.save()
                ctx.scale(exportScale, exportScale)
                ctx.translate(px, py)
                drawModelTreeOnCanvas(ctx, part.modelTree)
                ctx.restore()
            })
            ctx.globalCompositeOperation = 'source-over'

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${layout.name || 'artwork'}_clipped.png`
                a.click()
                URL.revokeObjectURL(url)
            }, 'image/png')
        }
        img.src = artDataUri
    }, [artDataUri, layout, partTable])

    const realSizeRatio = useRealScaleRatio()

    const [width, height] = useContainerSize(containerRef)
    const [[screenWidth, screenHeight], setScreenSize] = useAtom(screenSizeAtom)
    const [initialLoad, setInitialLoad] = useState(true)
    const securityContext = useSecurity()

    const [workspacePosition, setWorkspacePosition] = useAtom(
        workspacePositionAtom
    )
    const [zoom, setZoom] = useAtom(zoomAtom)
    const mode = ART_ADJUST
    const [editLock] = useAtom(editLockComponentAtom)
    const [scrollLock, setScrollLock] = useAtom(scrollLockComponentAtom)
    const [zoomLock] = useAtom(zoomLockComponentAtom)
    const [preview, setPreview] = useAtom(previewAtom)

    const [placingPartId] = useState('SANWA-24mm')
    const [placingPartType] = useState('button')
    const [afterSelect] = useState(null)

    const [selected] = useAtom(selectedAtom)
    const [hovered] = useState(null)

    const bind = useGesture(
        {
            onDrag: ({
                delta: [x, y],
                dragging,
                touches,
                buttons,
                shiftKey,
            }) => {
                if (scrollLock || mode === ART_ADJUST) {
                    return
                }

                if (
                    dragging &&
                    (touches === 2 || (buttons === 1 && shiftKey))
                ) {
                    setWorkspacePosition(([oldX, oldY]) => [oldX + x, oldY + y])
                }
            },
            onPinch: ({ offset: [d], memo }) => {
                if (zoomLock || preview || mode === ART_ADJUST) {
                    return
                }

                if (!memo) {
                    memo = zoom
                }

                setZoom(Math.max(1, memo * d))
                return memo
            },
        },
        {
            drag: {
                pointer: {
                    touch: true,
                    mouse: true,
                },
            },
            pinch: {
                pointer: {
                    touch: true,
                },
            },
        }
    )

    const onScroll = useCallback(
        ({ deltaX, deltaY }) => {
            if (zoomLock) {
                return
            }

            setZoom(Math.max(1, zoom - (deltaY || deltaX) / SCALE_RATIO))
        },
        [zoom, zoomLock, setZoom]
    )

    const [partsWidth, partsHeight] = calculateSizeOfPart(
        {
            type: 'custom',
            layout,
        },
        partTable
    )

    const centerWorkPiece = useCallback(() => {
        setScreenSize([window.innerWidth, window.innerHeight])

        if (
            !layout?.panelDimensions?.[0] &&
            !layout?.panelDimensions?.[1] &&
            !initialLoad
        ) {
            return
        }

        let contextWidth = partsWidth
        let contextHeight = partsHeight
        if (layout?.panelDimensions?.[0]) {
            contextWidth = layout?.panelDimensions[0]
        }

        if (layout?.panelDimensions?.[1]) {
            contextHeight = layout?.panelDimensions[1]
        }

        if (width > 0 && height > 0) {
            setWorkspacePosition([
                width / 2 - (contextWidth / 2) * zoom,
                height / 2 - (contextHeight / 2) * zoom,
            ])
        }
    }, [
        height,
        layout?.panelDimensions,
        partsHeight,
        partsWidth,
        setWorkspacePosition,
        setScreenSize,
        width,
        zoom,
        initialLoad,
    ])

    useEffect(() => {
        closeModal()
        if (!realSizeRatio) {
            openModal('options')
            return
        }

        setZoom(realSizeRatio)
    }, [realSizeRatio, preview, previewOverride, setZoom])

    useEffect(() => {
        setPreview(previewOverride)
    }, [previewOverride, setPreview])

    useEffect(() => {
        if (!containerRef?.current) {
            return () => {}
        }

        const element = containerRef.current
        element.addEventListener('wheel', onScroll)
        return () => {
            element.removeEventListener('wheel', onScroll)
        }
    }, [onScroll, containerRef, preview])

    useEffect(() => {
        if (!initialLoad) {
            return () => {}
        }

        if (isNew || (partsWidth > 0 && partsHeight > 0)) {
            setInitialLoad(false)
        }

        centerWorkPiece()
    }, [
        isNew,
        width,
        height,
        zoom,
        partsWidth,
        partsHeight,
        layout,
        preview,
        initialLoad,
        centerWorkPiece,
        setWorkspacePosition,
    ])

    useEffect(() => {
        window.addEventListener('resize', centerWorkPiece)
        window.addEventListener('orientationchange', centerWorkPiece)
        return () => {
            window.removeEventListener('resize', centerWorkPiece)
            window.removeEventListener('orientationchange', centerWorkPiece)
        }
    }, [centerWorkPiece])

    const screenX = workspacePosition[0]
    const screenY = workspacePosition[1]

    if (!layout) {
        return null
    }

    return (
        <div className="bg-[#1099bb]">
            <header className="absolute left-0 top-0 w-screen p-2 text-center text-xl font-extrabold text-white lg:hidden">
                <div>View Only Mode (Please use Desktop or Tablet to Edit)</div>
                <div>{layout?.name}</div>
            </header>

            <footer className="absolute bottom-0 left-0 w-screen p-2 text-center text-xl font-extrabold text-white lg:hidden">
                © 2025 Michael C Main
            </footer>

            {!preview ? (
                <>
                    <div
                        id="menu-bottom"
                        className="absolute bottom-0 left-0 hidden h-[80px] w-screen flex-row items-center justify-center gap-9 lg:flex"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <GenericButton
                            onClick={() => fileInputRef.current.click()}
                        >
                            Open Art
                        </GenericButton>
                        {artDataUri && (
                            <GenericButton
                                onClick={() => setArtMasked((v) => !v)}
                            >
                                {artMasked ? 'Unclip Art' : 'Clip to Panel'}
                            </GenericButton>
                        )}
                        {artDataUri && (
                            <GenericButton onClick={handleSavePng}>
                                Save PNG
                            </GenericButton>
                        )}
                        <ZoomButton
                            onZoomChange={(adj) => setZoom(zoom + adj)}
                            currentZoom={zoom}
                        />
                        {!securityContext ? (
                            <button
                                className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 text-white`}
                                onClick={login}
                            >
                                Login
                            </button>
                        ) : (
                            <div>Logged in as {securityContext.username}</div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="absolute bottom-0 left-0 flex h-[80px] w-screen flex-row items-center justify-center">
                        <LockToggleButton
                            locked={scrollLock}
                            onClick={setScrollLock}
                        >
                            Scroll
                        </LockToggleButton>
                    </div>
                </>
            )}

            <div ref={containerRef} {...bind()}>
                <LayoutDisplay
                    workspaceRef={containerRef}
                    layout={layout}
                    currentScale={zoom}
                    screenWidth={screenWidth}
                    screenHeight={screenHeight}
                    selected={selected}
                    hovered={hovered}
                    mode={mode}
                    locked={editLock}
                    workspaceDimensions={[width, height]}
                    workspacePosition={[screenX, screenY]}
                    placingPartId={placingPartId}
                    placingPartType={placingPartType}
                    artDataUri={artDataUri}
                    artMasked={artMasked}
                    preview={preview}
                    onHoverPart={() => {}}
                    onSelectPart={() => {}}
                    onSecondarySelectPart={afterSelect}
                    onClickPart={() => {}}
                    onLayoutChange={onLayoutChange}
                />
            </div>
        </div>
    )
}

export default ArtDesigner
