import { useEffect, useState, useRef } from 'react'
import { CacheOptions, useCache } from './useCache'
import firebase from 'firebase'
import { CallbackManager } from './CallbackManager'




export type FilterOptions<T, K> = {
	where: Array<
		[
			path: K,
			compare_function: firebase.firestore.WhereFilterOp,
			value: string | number | boolean | string[] | number[],
		]
	>,
}

export type PagingOptions<K> = {
	order_by: K,
	limit: number,
	direction: 'desc' | 'asc'
}

export type useCollectionDataOptions<T extends {}, K extends keyof T = keyof T> = PagingOptions<K> & FilterOptions<T, K> & CacheOptions

export const useCollectionData = <T extends {}, K extends keyof T = keyof T>(
	ref: string,
	options: Partial<useCollectionDataOptions<T, K>> = {}
) => {
	const { direction = 'desc', limit = 10, order_by, where = [] } = options

	const isFilterQuery = ref?.split('/').length % 2 != 0
	const [cache, update_cache] = useCache<T[]>(`${ref}#${JSON.stringify(where)}#${order_by}#${limit}#${direction}`)

	const [items, update_items] = useState<firebase.firestore.DocumentSnapshot<T>[]>([])

	const [{ error, has_more, loading }, setState] = useState({ loading: true, error: null, has_more: false })

	const listeners = useRef(new CallbackManager())

	function sync(old_items: firebase.firestore.DocumentSnapshot<T>[], docs: firebase.firestore.DocumentChange<T>[]) {

		const exists_ids = new Set(old_items.map(d => d.id))
		const removed = new Set(
			docs.filter(x => x.type == 'removed').map(x => x.doc.id),
		)
		const added = docs.filter(d => !exists_ids.has(d.doc.id)).map(d => d.doc)
		const modified = new Map(
			docs
				.filter(d => d.type != 'removed' && exists_ids.has(d.doc.id))
				.map(d => [d.doc.id, d.doc]),
		)

		return [
			...old_items
				.filter(item => !removed.has(item.id))
				.map(d => (modified.has(d.id) ? modified.get(d.id) : d)),
			...added
		]
	}

	function filters_query_builder(
		startAfter: firebase.firestore.QueryDocumentSnapshot<T>,
		limit: number
	) {
		const collection = firebase.firestore().collection(ref)
		let query = collection.limit(limit)
		for (const [fieldPath, opStr, value] of where) {
			query = query.where(fieldPath as string, opStr, value)
		}
		order_by && (query = query.orderBy(order_by as any, direction))
		startAfter && (query = query.startAfter(startAfter))
		return query

	}

	async function document_query() {
		const refs = ref.split('/')
		const colelctionRef = refs.slice(0, refs.length - 1).join('/')
		const documentId = refs[refs.length - 1]
		listeners.current.push(
			firebase.firestore().collection(colelctionRef).doc(documentId).onSnapshot((snapshot: firebase.firestore.DocumentSnapshot<T>) => {
				update_items([snapshot])
				update_cache([snapshot.data()])
				setState({ error: false, has_more: false, loading: false })
			})
		)
	}

	function error_handler(error: firebase.firestore.FirestoreError) {
		setState({ error, has_more: false, loading: false })
	}

	async function fetch_more() {

		setState({ error: null, has_more: false, loading: true })

		const startAfter = items && items[items.length - 1]

		const docs = await new Promise<firebase.firestore.DocumentChange<T>[]>(s => {
			const query = filters_query_builder(startAfter, limit + 1)
			listeners.current.push(
				query.onSnapshot(snapshot => {
					const docs = snapshot.docChanges() as any as firebase.firestore.DocumentChange<T>[]
					s(docs)
					update_items(items => sync(items, docs.slice(0, limit)))
				}, error_handler),
			)
		})

		startAfter == null && update_cache(docs.map(doc => doc.doc.data()))
		setState({ error: null, has_more: docs.length > limit, loading: false })
	}

	useEffect(() => {
		update_items([])
		if (!ref) return
		isFilterQuery ? fetch_more() : document_query()
		return () => {
			listeners.current.clear()
		}
	}, [ref, JSON.stringify(where), limit, order_by, direction])

	const data: T[] = (loading && items.length == 0 && cache) ? cache : items.map(d => ({ id: d.id, ...d.data() }))

	async function add(data: Partial<T> & { id: string }) {
		if (data.id) {
			await firebase.firestore().collection(ref).doc(data.id).set({
				created_at: Date.now(),
				...data
			})
		} else {
			await firebase.firestore().collection(ref).add({
				created_at: Date.now(),
				...data
			})
		}
	}



	return {
		data,
		loading,
		error,
		fetch_more,
		has_more,
		empty: !loading && data.length == 0,
		add
	}
}




