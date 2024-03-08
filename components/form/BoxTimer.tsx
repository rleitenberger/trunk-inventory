import { useEffect, useState } from "react";

export default function BoxTimer ({ delay, onDelayReached, note }: {
    delay: number;
    onDelayReached: () => void;
    note?: string;
}) {

    const [secondsLeft, setSecondsLeft] = useState<number>(delay);
    const [delayReached, setDelayReached] = useState<boolean>(false);

    useEffect(() => {
        const timeout = setInterval(() => {

            setSecondsLeft((prev) => {
                if (prev - 1  <= 0){
                    setDelayReached(true);
                    clearInterval(timeout);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timeout);
        }
    }, []);

    useEffect(() => {
        if (!delayReached) {
            return;
        }

        onDelayReached();
    }, [delayReached]);

    return (
        <div className="relative">
            {note && (
                <div className="text-xs font-medium text-center p-2">
                    {note} in {secondsLeft}s
                </div>
            )}
            <div className="absolute left-0 right-0 bottom-0 h-[4px]">
                <div className="box-timer h-[4px] --timer bg-blue-400"
                style={{
                    animationDuration: `${delay}s`
                }}></div>
            </div>
        </div>
    )
}