

import { useEffect, useState } from "react"
import firebase from 'firebase'

export function useAuth() {
    const currentUser = firebase.auth().currentUser
    const [{ user, loading }, setState] = useState({ user: currentUser, loading: currentUser == null })
    const [claims, set_claims] = useState({})

    async function getClaims() {
        const { claims } = await firebase.auth().currentUser.getIdTokenResult()
        set_claims(claims)
    }

    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => {
            setState({ user, loading: false })
        })
        getClaims()
    }, [])

    return { user, loading, claims }
}