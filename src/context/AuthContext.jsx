import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../utilities/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          const role = userDoc.exists() ? userDoc.data().role : 'user'
          setUser({ ...currentUser, role })
        } catch (error) {
          console.error('Error fetching user role:', error)
          setUser({ ...currentUser, role: 'user' })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
