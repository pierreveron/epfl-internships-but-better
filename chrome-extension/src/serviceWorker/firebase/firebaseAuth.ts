import { GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { app } from './firebaseApp'
import { handleSignUp, handleSignIn } from './firebaseFunctions'

export const auth = getAuth(app)

const clientId = chrome.runtime.getManifest().oauth2?.client_id ?? ''

const getGoogleAuthCredential = () => {
  return new Promise<ReturnType<typeof GoogleAuthProvider.credential>>((resolve, reject) => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&scope=email%20profile&redirect_uri=${chrome.identity.getRedirectURL()}&prompt=select_account&hd=epfl.ch`

    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (responseUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        reject(chrome.runtime.lastError)
        return
      }

      if (!responseUrl) {
        reject(new Error('Failed to get response URL'))
        return
      }

      const url = new URL(responseUrl)
      const params = new URLSearchParams(url.hash.slice(1))
      const accessToken = params.get('access_token')

      if (!accessToken) {
        reject(new Error('Failed to get access token'))
        return
      }

      const credential = GoogleAuthProvider.credential(null, accessToken)
      resolve(credential)
    })
  })
}

export const signIn = async (): Promise<User | null> => {
  try {
    const credential = await getGoogleAuthCredential()
    console.log('credential', credential)
    const result = await signInWithCredential(auth, credential)
    console.log('result', result)

    if (!result.user?.email) {
      throw new Error('No email found in Firebase user')
    }

    const response = (await handleSignIn({ email: result.user.email })) as {
      data: {
        success: boolean
        error: string | null
      }
    }
    console.log('Sign-in response:', response.data)

    if (!response.data.success) {
      throw new Error(response.data.error || 'Sign-in verification failed')
    }

    // If everything succeeded, return the user
    return result.user
  } catch (e) {
    await auth.signOut()
    console.error('Error during sign-in:', e)
    throw e
  }
}

export const signUp = async (referralCode?: string): Promise<User | null> => {
  try {
    const credential = await getGoogleAuthCredential()
    console.log('credential', credential)
    const result = await signInWithCredential(auth, credential)
    console.log('result', result)

    if (!result.user?.email) {
      throw new Error('No email found in Firebase user')
    }

    const response = (await handleSignUp({ email: result.user.email, referralCode })) as {
      data: {
        success: boolean
        error: string | null
      }
    }
    console.log('Sign-up response:', response.data)

    if (!response.data.success) {
      throw new Error(response.data.error || 'Sign-up failed')
    }

    // Refresh the user to get the latest custom claims
    await result.user.getIdToken(true)
    return result.user
  } catch (e) {
    await auth.signOut()
    console.error('Error during sign-up:', e)
    throw e
  }
}
