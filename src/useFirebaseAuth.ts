

import { useEffect, useState } from "react"
import firebase from 'firebase'

export function useFirebaseAuth() {
    const [{ user, loading }, setState] = useState({ user: firebase.auth().currentUser, loading: true })

    useEffect(() => firebase.auth().onAuthStateChanged(user => {
        setState({ user, loading: false })
    }), [])

    return { user, loading }
}