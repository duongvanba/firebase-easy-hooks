import { useState } from 'react'
import firebase from 'firebase'
import { FilterOptions, useCollectionData } from './useCollectionData'
import { CacheOptions } from './useCache'

export const useDocumentData = <
	T extends {},
	K extends keyof T = keyof T
>(
	ref: string,
	options: FilterOptions<T, K> & CacheOptions
) => {
	const refs = ref.split('/')
	const collectionRef = refs.slice(0, refs.length - 1).join('/')
	const docId = refs[refs.length - 1]

	const [updating, set_updating] = useState(false)
	const [deleting, set_deleting] = useState(false)

	async function del() {
		set_deleting(true)
		await firebase.firestore().collection(collectionRef).doc(docId).delete()
	}

	async function update(data: Partial<T>) {
		set_updating(true)
		await firebase.firestore().collection(collectionRef).doc(docId).update(data)
		set_updating(false)
	}

	const { data, loading, error } = useCollectionData<T>(ref, options)
	return { data: data[0], loading, error, deleting, updating, del, update }
} 