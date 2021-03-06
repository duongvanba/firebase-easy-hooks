import { useState } from "react";

export type CacheOptions = {
    cache: 'none' | 'local-storage' | 'session-storage' | 'always',
    cache_timeout_ms: number
}

export function useCache<T>(key: string, defaultValue: T = null, options: Partial<CacheOptions> = {}) {

    const cacheValue = key && typeof localStorage != 'undefined' && localStorage.getItem(key)

    const [state, setState] = useState<T>(cacheValue ? JSON.parse(cacheValue) : defaultValue)

    const updater = (value: T) => {
        setState(oldData => {
            typeof localStorage != 'undefined' && localStorage.setItem(key, JSON.stringify(value))
            return typeof value != 'function' ? value : value(oldData)
        })
    }

    return [state, updater] as [T, (data: (T | ((oldData: T) => T))) => void]
}