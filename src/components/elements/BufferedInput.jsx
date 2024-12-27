import React, { useEffect, useState } from 'react'

const BufferedInput = ({ value, type, onChange }) => {
    const [buffer, setBuffer] = useState()

    const update = (newValue) => {
        if (type === 'number' && (newValue === '' || isNaN(Number(newValue)))) {
            newValue = value
            setBuffer(newValue)
        }
        onChange(newValue)
    }

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            update(buffer)
            event.preventDefault()
        }
    }

    useEffect(() => {
        setBuffer(value)
    }, [value])

    return (
        <>
            <input
                type={type}
                value={buffer}
                onChange={({ target: { value } }) => {
                    setBuffer(value)
                }}
                onBlur={() => update(buffer)}
                onKeyDown={onKeyDown}
            />
        </>
    )
}

export default BufferedInput
