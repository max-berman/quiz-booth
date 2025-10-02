import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react'
import {
	User,
	sendSignInLinkToEmail,
	isSignInWithEmailLink,
	signInWithEmailLink,
	signInWithPopup,
	signInWithRedirect,
	getRedirectResult,
	GoogleAuthProvider,
	signOut as firebaseSignOut,
	onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { analytics } from '../lib/analytics'

interface AuthContextType {
	user: User | null
	loading: boolean
	sendSignInLink: (email: string) => Promise<void>
	signInWithGoogle: () => Promise<void>
	completeSignIn: (email: string) => Promise<void>
	signOut: () => Promise<void>
	isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let unsubscribe: () => void

		const initializeAuth = async () => {
			try {
				// Handle redirect result when user returns from Google auth
				const result = await getRedirectResult(auth)
				if (result?.user) {
					// User signed in via redirect
				}
			} catch (error) {
				console.error('Error handling redirect result:', error)
			}

			// Set up auth state listener after handling redirect
			unsubscribe = onAuthStateChanged(auth, (user) => {
				setUser(user)
				setLoading(false)
			})
		}

		initializeAuth()

		return () => {
			if (unsubscribe) {
				unsubscribe()
			}
		}
	}, [])

	const sendSignInLink = async (email: string): Promise<void> => {
		// For now, let's use a simple approach that works with any domain
		const actionCodeSettings = {
			url: `${window.location.origin}/auth/complete`,
			handleCodeInApp: true,
		}

		try {
			await sendSignInLinkToEmail(auth, email, actionCodeSettings)
			localStorage.setItem('emailForSignIn', email)
		} catch (error: any) {
			console.error('Email link error:', error)
			throw new Error(
				'Email authentication is not configured. Please use Google sign-in instead.'
			)
		}
	}

	const signInWithGoogle = async (): Promise<void> => {
		try {
			const provider = new GoogleAuthProvider()
			await signInWithPopup(auth, provider)

			// Track successful sign-in
			analytics.trackUserSignIn('google')
		} catch (error: any) {
			// Track authentication error
			analytics.trackError({
				type: 'authentication',
				message: error.message || 'Google sign-in failed',
				context: 'signInWithGoogle',
			})

			// Check if it's a COOP error but authentication still succeeded
			if (
				(error.message?.includes('Cross-Origin-Opener-Policy') ||
					error.message?.includes('window.closed')) &&
				auth.currentUser
			) {
				// Authentication succeeded despite COOP error
				return
			}

			if (error.code === 'auth/unauthorized-domain') {
				throw new Error(
					`This domain (${window.location.origin}) is not authorized for Firebase authentication. Please add it to your Firebase project's authorized domains in the Firebase Console under Authentication > Settings > Authorized domains.`
				)
			}

			throw error
		}
	}

	const completeSignIn = async (email: string): Promise<void> => {
		if (!isSignInWithEmailLink(auth, window.location.href)) {
			throw new Error('Invalid sign-in link')
		}

		try {
			await signInWithEmailLink(auth, email, window.location.href)
			// Clear stored email
			localStorage.removeItem('emailForSignIn')
		} catch (error) {
			console.error('Error completing sign-in:', error)
			throw error
		}
	}

	const signOut = async (): Promise<void> => {
		try {
			await firebaseSignOut(auth)
		} catch (error) {
			console.error('Error signing out:', error)
			throw error
		}
	}

	const value: AuthContextType = {
		user,
		loading,
		sendSignInLink,
		signInWithGoogle,
		completeSignIn,
		signOut,
		isAuthenticated: !!user,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
