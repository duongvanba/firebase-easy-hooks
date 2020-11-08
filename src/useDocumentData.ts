import firebase from 'firebase/app'
import { useCollectionData } from './useCollectionData'

export const useDocumentData = <
	T extends {},
	K extends keyof T = keyof T
>(
	ref: string,
	where: Array<
		[
			fieldPath: K,
			opStr: firebase.firestore.WhereFilterOp,
			value: string | number | boolean,
		]
	> = [],
) => {
	const { data, loading, error } = useCollectionData<T>(ref, where)
	return { data: data[0], loading, error }
} 