import React from 'react'
import BufferedInput from '../elements/BufferedInput'

const calculateLength = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

const updateCoordinatesWithLength = (x1, y1, x2, y2, newLength) => {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const newX2 = x1 + newLength * Math.cos(angle)
    const newY2 = y1 + newLength * Math.sin(angle)
    return { x2: newX2, y2: newY2 }
}

const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI) // Convert to degrees
}

const updateCoordinatesWithAngle = (x1, y1, x2, y2, newAngle) => {
    const length = calculateLength(x1, y1, x2, y2)
    const angleInRadians = newAngle * (Math.PI / 180) // Convert to radians
    const newX2 = x1 + length * Math.cos(angleInRadians)
    const newY2 = y1 + length * Math.sin(angleInRadians)
    return { x2: newX2, y2: newY2 }
}

const GeometryMenu = ({ selectedGeometry, onUpdate }) => {
    if (!selectedGeometry) {
        return null
    }

    console.log(
        'SELECTED GEOMETRY: ' + JSON.stringify(selectedGeometry, null, 5)
    )

    return (
        <div className="absolute right-[10px] hidden h-screen max-w-[300px] flex-col gap-1 overflow-y-auto border-2 border-white bg-slate-400 p-2 lg:flex">
            <h2 className="text-center text-[1rem] font-bold">
                Geometry Details
            </h2>
            <div className="flex flex-col gap-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                    <label>length:</label>
                    <BufferedInput
                        id={`${selectedGeometry.x1}${selectedGeometry.y1}${selectedGeometry.x2}${selectedGeometry.y2}-length`}
                        type="number"
                        value={calculateLength(
                            selectedGeometry.x1,
                            selectedGeometry.y1,
                            selectedGeometry.x2,
                            selectedGeometry.y2
                        )}
                        onChange={(value) => {
                            onUpdate({
                                ...selectedGeometry,
                                ...updateCoordinatesWithLength(
                                    selectedGeometry.x1,
                                    selectedGeometry.y1,
                                    selectedGeometry.x2,
                                    selectedGeometry.y2,
                                    value
                                ),
                            })
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>angle:</label>
                    <BufferedInput
                        id={`${selectedGeometry.x1}${selectedGeometry.y1}${selectedGeometry.x2}${selectedGeometry.y2}-angle`}
                        type="number"
                        value={calculateAngle(
                            selectedGeometry.x1,
                            selectedGeometry.y1,
                            selectedGeometry.x2,
                            selectedGeometry.y2
                        )}
                        onChange={(value) => {
                            onUpdate({
                                ...selectedGeometry,
                                ...updateCoordinatesWithAngle(
                                    selectedGeometry.x1,
                                    selectedGeometry.y1,
                                    selectedGeometry.x2,
                                    selectedGeometry.y2,
                                    value
                                ),
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default GeometryMenu
