import React, { useEffect } from 'react'

const Dev = () => {
    useEffect(() => {
        let urlParams = new URLSearchParams(window.location.search)
        let accessToken = urlParams.get('accessToken')
        let currentToken = localStorage.getItem('accessToken')
        if (currentToken !== accessToken) {
            localStorage.setItem('accessToken', accessToken)
            window.location.reload()
        } else {
            window.location = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${process.env.PUBLIC_URL}/`
        }
    }, [])

    return (
        <div className="App">
            <p>
                You are now setup with an access token. It will only be good for
                an hour.
            </p>
        </div>
    )
}

export default Dev
