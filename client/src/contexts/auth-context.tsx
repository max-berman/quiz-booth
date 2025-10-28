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
import { firebaseAnalytics } from '../lib/firebase-analytics'

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
		// Use dynamic URL that works with any domain
		const actionCodeSettings = {
			url: `${window.location.origin}/auth/complete`,
			handleCodeInApp: true,
			// iOS and Android settings for better mobile experience
			dynamicLinkDomain: 'quizbooth.page.link', // Optional: Set up Firebase Dynamic Links
		}

		try {
			await sendSignInLinkToEmail(auth, email, actionCodeSettings)
			localStorage.setItem('emailForSignIn', email)

			// Track email sign-in attempt for analytics
			firebaseAnalytics.trackUserSignIn('email')
		} catch (error: any) {
			console.error('Email link error:', error)

			// Track authentication error
			firebaseAnalytics.trackError({
				type: 'authentication',
				message: error.message || 'Email sign-in failed',
				context: 'sendSignInLink',
			})

			// Provide more specific error messages
			if (error.code === 'auth/invalid-email') {
				throw new Error('Please enter a valid email address.')
			} else if (error.code === 'auth/too-many-requests') {
				throw new Error('Too many sign-in attempts. Please try again later.')
			} else {
				throw new Error(
					'Unable to send sign-in link. This may be due to email deliverability issues. Please try Google sign-in instead or contact support.'
				)
			}
		}
	}

	const signInWithGoogle = async (): Promise<void> => {
		try {
			const provider = new GoogleAuthProvider()
			await signInWithPopup(auth, provider)

			// Track successful sign-in
			firebaseAnalytics.trackUserSignIn('google')
		} catch (error: any) {
			// Track authentication error
			firebaseAnalytics.trackError({
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
