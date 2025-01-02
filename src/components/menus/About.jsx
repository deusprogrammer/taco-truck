import React from 'react'
import config from '../../../package.json'

const AboutModal = ({ open, onClose }) => {
    if (!open) {
        return null
    }

    return (
        <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
            <div className="z-40 flex h-full w-full flex-col items-center justify-center gap-10 border-2 border-black bg-slate-800 p-10 text-white">
                <h3 className="text-[1.8rem]">Options</h3>
                <div className="w-1/3 text-center">
                    <h4 className="text-[1.3rem]">License Details</h4>
                    <h5>Taco Truck v{config.version}</h5>
                    <p>Offered under the GNU GPL V3 License</p>
                    <p>© 2025 Michael C Main</p>
                </div>
                <div className="flex w-1/3 flex-col gap-2 text-center">
                    <h4 className="text-[1.3rem]">About Taco Truck</h4>
                    <p className="text-left">
                        Hey there, I hope you are enjoying this app and finding
                        it useful. And if you are finding it useful, would you
                        consider buying me a cup of coffee, some acrylic, or
                        some filament? Pop on down to Kofi and drop some coin in
                        my tip jar if the mood strikes you =3
                    </p>
                    <hr />
                    <button
                        onClick={() =>
                            window.open('https://ko-fi.com/michaelcmain52278')
                        }
                        className="bg-slate-500 p-2"
                    >
                        Donate =3
                    </button>
                    <button className="bg-slate-500 p-2" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AboutModal
