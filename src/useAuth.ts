

import { useEffect, useState } from "react"
import firebase from 'firebase'

export function useAuth() {
    const currentUser = firebase.auth().currentUser
    const [{ user, loading }, setState] = useState({ user: currentUser, loading: currentUser == null })

    useEffect(() => firebase.auth().onAuthStateChanged(user => {
        setState({ user, loading: false })
    }), [])

    return { user, loading }
}