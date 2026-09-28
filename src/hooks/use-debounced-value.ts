"use client"

import { useEffect, useState } from "react"


export function useDebouncedValue<T>(value: T, delayMs = 400): T {
    const [debounce, setDebounce] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounce(value), delayMs);
        return () => clearTimeout(id);
    });

    return debounce;
}