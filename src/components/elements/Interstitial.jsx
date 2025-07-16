const Interstitial = ({ title = 'Loading...', message }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-2xl">
                {/* Spinner */}
                <div className="mb-6">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>

                {/* Title */}
                <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    {title}
                </h2>

                {/* Message */}
                {message && (
                    <p className="leading-relaxed text-gray-600">{message}</p>
                )}
            </div>
        </div>
    )
}

export default Interstitial
