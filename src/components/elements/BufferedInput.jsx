import React, { useEffect, useState, useRef } from 'react'
import { usePrevious } from '../../hooks/MouseHooks'

const BufferedInput = ({
    id,
    value,
    className = '',
    type,
    immediate,
    onChange,
    disabled = false,
    timeout = null, // Optional timeout in milliseconds
    placeholder,
}) => {
    const [buffer, setBuffer] = useState()
    const [isDirty, setIsDirty] = useState(false)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const previousId = usePrevious(id)
    const timeoutRef = useRef(null)

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

        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        setIsDirty(false)
        setIsCountingDown(false)
        onChange(newValue)
    }

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            update(buffer)
            event.preventDefault()
        }

        event.stopPropagation()
    }

    const handleBufferChange = (newValue) => {
        setBuffer(newValue)
        const hasChanged = newValue !== value
        setIsDirty(hasChanged)

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        if (immediate) {
            if (type === 'number') {
                newValue = parseFloat(newValue)
            }
            onChange(newValue)
            setIsDirty(false)
        } else if (timeout && hasChanged) {
            // Set up timeout functionality
            setIsCountingDown(true)
            timeoutRef.current = setTimeout(() => {
                update(newValue)
            }, timeout)
        }
    }

    useEffect(() => {
        setBuffer(value)
        setIsDirty(false)
        setIsCountingDown(false)

        // Clear timeout if value changes externally
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [value, id])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    // Determine styling based on state
    const getInputClassName = () => {
        let classes = className

        if (isDirty && !isCountingDown) {
            classes += ' border-yellow-400 border-2 bg-yellow-50'
        } else if (isCountingDown) {
            classes += ' border-blue-400 border-2 bg-blue-50 animate-pulse'
        }

        return classes
    }

    return (
        <div className="relative w-[80%]">
            <input
                id={id}
                type={type}
                className={getInputClassName()}
                value={buffer}
                disabled={disabled}
                placeholder={placeholder}
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                onChange={({ target: { value } }) => {
                    handleBufferChange(value)
                }}
                onBlur={() => update(buffer)}
                onKeyDown={onKeyDown}
            />
            {isDirty && timeout && (
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 transform">
                    {isCountingDown ? (
                        <div className="flex items-center text-blue-600">
                            <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            <span className="text-xs">auto-applying...</span>
                        </div>
                    ) : (
                        <div className="text-xs text-yellow-600">unsaved</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default BufferedInput
