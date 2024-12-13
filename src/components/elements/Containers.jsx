const tailMap = {
    width: "w",
    height: "h",
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left"
};

export const Window = ({visible, children, ...props}) => {
    let positioning = "";
    let sep = "";
    Object.keys(props).forEach((key) => {
        const value = props[key];
        positioning += `${sep}${tailMap[key]}-[${value}]`;
        sep = " ";
    });

    console.log("POSITIONING: " + positioning);

    return (
        visible ? <div className={`flex flex-row justify-around items-center gap-10 absolute left-[0px] bottom-[0px] z-50 border-solid border-white bg-slate-400`}>
            {children}
        </div> : null
    );
};