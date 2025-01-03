import React, { useCallback, useEffect, useState } from 'react'

export const openModal = (modalKey) => {
    let event = new Event('openModal')
    event.modalKey = modalKey
    event.action = 'open'
    dispatchEvent(event)
}

export const closeModal = () => {
    let event = new Event('openModal')
    event.action = 'close'
    dispatchEvent(event)
}

export const ModalButton = ({ modalKey, children }) => (
    <button
        className={`h-20 w-64 border-2 border-solid border-black bg-slate-600 p-2 text-white`}
        onClick={() => {
            openModal(modalKey)
        }}
    >
        {children}
    </button>
)

const ModalContainer = ({ modalMapping }) => {
    const [modal, setModal] = useState(null)

    const handleOpenModal = useCallback(
        ({ modalKey, action }) => {
            if (action === 'open') {
                const modal = modalMapping[modalKey]
                setModal(
                    React.cloneElement(modal, {
                        open: true,
                        onClose: closeModal,
                    })
                )
            } else {
                setModal(null)
            }
        },
        [modalMapping]
    )

    useEffect(() => {
        window.addEventListener('openModal', handleOpenModal)
        return () => {
            window.removeEventListener('openModal', handleOpenModal)
        }
    }, [modalMapping, handleOpenModal])

    if (!modal) {
        return null
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            {modal}
        </div>
    )
}

export default ModalContainer
