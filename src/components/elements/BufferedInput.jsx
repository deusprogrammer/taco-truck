import React, { useEffect, useState } from 'react'
import { usePrevious } from '../../hooks/MouseHooks'

const BufferedInput = ({ id, value, className, type, immediate, onChange }) => {
    const [buffer, setBuffer] = useState()
    const previousId = usePrevious(id)

    const update = (newValue) => {
        if (type === 'number' && (newValue === '' || isNaN(Number(newValue)))) {
            newValue = value
            setBuffer(newValue)
        }

        if (type === 'number') {
            newValue = parseFloat(newValue)
        }

        if (previousId !== id) {
            return
        }

        onChange(newValue)
    }

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            update(buffer)
            event.preventDefault()
        }

        event.stopPropagation()
    }

    useEffect(() => {
        setBuffer(value)
    }, [value, id])

    return (
        <>
            <input
                id={id}
                type={type}
                className={className}
                value={buffer}
                onChange={({ target: { value } }) => {
                    setBuffer(value)
                    if (immediate) {
                        if (type === 'number') {
                            value = parseFloat(value)
                        }
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
