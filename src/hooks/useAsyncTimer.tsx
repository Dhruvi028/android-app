import { useEffect, useRef } from 'react';

export const useAsyncTimer = (callback: () => void, durationMs: number) => {
    const isActiveRef = useRef(true);

    useEffect(() => {
        isActiveRef.current = true;

        const runTimer = async () => {
            await new Promise((resolve) => setTimeout(resolve, durationMs));

            if (isActiveRef.current) {
                callback();
            }
        };

        runTimer();

        return () => {
            isActiveRef.current = false;
        };
    }, [durationMs, callback]);
};
