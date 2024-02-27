import React, { useEffect, useRef } from 'react';

export default function OutsideClickHandler ({ children, onOutsideClick }: {
    children: React.ReactNode
    onOutsideClick: CallableFunction
}) {
    const ref: any = useRef();

    useEffect(() => {
        const handleClick = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)){
                onOutsideClick();
            }
        }

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        }
    }, [onOutsideClick]);

    return (
        <div ref={ref}>
            {children}
        </div>
    )
}