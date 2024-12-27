const tailMap = {
    width: 'w',
    height: 'h',
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
}

export const Window = ({ visible, children, ...props }) => {
    let positioning = ''
    let sep = ''
    Object.keys(props).forEach((key) => {
        const value = props[key]
        positioning += `${sep}${tailMap[key]}-[${value}]`
        sep = ' '
    })

    console.log('POSITIONING: ' + positioning)

    return visible ? (
        <div
            className={`absolute bottom-[0px] left-[0px] z-50 flex flex-row items-center justify-around gap-10 border-solid border-white bg-slate-400`}
        >
            {children}
        </div>
    ) : null
}
