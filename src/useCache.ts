import { useState } from "react";



export function useCache<T>(key: string, defaultValue: T = null) {

    const cacheValue = key && localStorage.getItem(key)

    const [state, setState] = useState<T>(cacheValue ? JSON.parse(cacheValue) : defaultValue)

    const updater = (value: T) => {
        setState(oldData => {
            typeof localStorage != 'undefined' && localStorage.setItem(key, JSON.stringify(value))
            return typeof value != 'function' ? value : value(oldData)
        })
    }

    return [state, updater] as [T, (data: (T | ((oldData: T) => T))) => void]
}