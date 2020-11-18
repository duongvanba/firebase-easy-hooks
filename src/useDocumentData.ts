import { CacheOptions, FilterOptions, useCollectionData } from './useCollectionData'

export const useDocumentData = <
	T extends {},
	K extends keyof T = keyof T
>(
	ref: string,
	options: FilterOptions<T, K> & CacheOptions
) => {
	const { data, loading, error } = useCollectionData<T>(ref, options)
	return { data: data[0], loading, error }
} 