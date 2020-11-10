import firebase from 'firebase/app'
import { useCollectionData } from './useCollectionData'

export const useDocumentData = <
	T extends {},
	K extends keyof T = keyof T
>(
	ref: string,
	where: Array<
		[
			path: K,
			compare_function: firebase.firestore.WhereFilterOp,
			value: string | number | boolean | string[] | number[],
		]
	> = [],
) => {
	const { data, loading, error } = useCollectionData<T>(ref, { where, limit: 1 })
	return { data: data[0], loading, error }
} 