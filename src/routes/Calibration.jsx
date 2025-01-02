import { useAtom } from 'jotai'
import { useDrag } from '@use-gesture/react'
import { renderMeasurementsAtom } from '../atoms/ViewOptions.atom'
import { useEffect, useState } from 'react'

const CC_WIDTH = 85.6
const CC_HEIGHT = 53.98

const Calibration = () => {
    const [screenHeight, setScreenHeight] = useAtom(renderMeasurementsAtom)
    const [rect, setRect] = useState([])

    const bind = useDrag(({ xy: [x, y], dragging, memo }) => {
        if (!memo) {
            memo = {
                startX: x,
                startY: y,
            }
        }

        setRect([memo.startX, memo.startY, x, y])
        return memo
    })

    useEffect(() => {
        // Prevent overscroll
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'

        // Prevent overscroll on iOS
        const preventOverscroll = (event) => {
            if (event.touches.length > 1) {
                event.preventDefault()
            }
        }

        document.addEventListener('touchmove', preventOverscroll, {
            passive: false,
        })

        return () => {
            // Clean up the styles and event listener when the component unmounts
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
            document.removeEventListener('touchmove', preventOverscroll)
        }
    }, [])

    const width = rect[2] - rect[0]
    const height = rect[3] - rect[1]
    const ratio = (width / CC_WIDTH + height / CC_HEIGHT) / 2

    return (
        <div
            className="flex h-screen w-screen flex-col items-center justify-center bg-slate-800 text-white"
            style={{ overscrollBehavior: 'none', userSelect: 'none' }}
            {...bind()}
        >
            {ratio ? (
                <div
                    className={`absolute flex flex-col items-center justify-center border-2 border-white`}
                    style={{
                        left: rect[0],
                        top: rect[1],
                        width,
                        height,
                    }}
                >
                    <div>
                        {width}px X {height}px
                    </div>
                    <div>
                        ({CC_WIDTH}mm X {CC_HEIGHT}mm)
                    </div>
                    <div>Ratio: {ratio}</div>
                </div>
            ) : null}
            <h3 className="text-[1.8rem]">Calibration</h3>
            <p>
                Please place your drivers license or a debit/credit card in the
                corner of your screen and draw a square around it.
            </p>
            <div className="flex flex-row gap-1">
                <svg
                    width={50 * ratio}
                    height={50 * ratio}
                    style={{ overflow: 'visible' }}
                >
                    <circle
                        r={(26 / 2) * ratio}
                        cx={100}
                        cy={100}
                        fill="#32CD32"
                        stroke="black"
                        strokeWidth={1}
                    />
                    <circle
                        r={(19 / 2) * ratio}
                        cx={100}
                        cy={100}
                        stroke="black"
                        strokeWidth={1}
                        fill="#32CD32"
                    />
                </svg>
                <svg
                    width={50 * ratio}
                    height={50 * ratio}
                    style={{ overflow: 'visible' }}
                >
                    <circle
                        r={(32 / 2) * ratio}
                        cx={100}
                        cy={100}
                        fill="#32CD32"
                        stroke="black"
                        strokeWidth={1}
                    />
                    <circle
                        r={(24 / 2) * ratio}
                        cx={100}
                        cy={100}
                        fill="#32CD32"
                        stroke="black"
                        strokeWidth={1}
                    />
                </svg>
            </div>
        </div>
    )
}

export default Calibration
