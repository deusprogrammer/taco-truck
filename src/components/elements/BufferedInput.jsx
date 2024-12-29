import React, { useEffect, useState } from 'react'

const BufferedInput = ({ value, className, type, immediate, onChange }) => {
    const [buffer, setBuffer] = useState()

    const update = (newValue) => {
        if (type === 'number' && (newValue === '' || isNaN(Number(newValue)))) {
            newValue = value
            setBuffer(newValue)
        }

        if (type === 'number') {
            newValue = parseFloat(newValue)
        }

        console.log('UPDATE: ' + newValue)

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
                className={className}
                value={buffer}
                onChange={({ target: { value } }) => {
                    setBuffer(value)
                    if (immediate) {
                        if (type === 'number') {
                            value = parseFloat(value)
                        }
                        console.log('IMMEDIATE')
                        onChange(value)
                    }
                }}
                onBlur={() => update(buffer)}
                onKeyDown={onKeyDown}
            />
        </>
    )
}

export default BufferedInput
