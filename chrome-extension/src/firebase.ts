import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

const clientId = chrome.runtime.getManifest().oauth2?.client_id ?? ''

const getGoogleAuthCredential = () => {
  return new Promise<ReturnType<typeof GoogleAuthProvider.credential>>((resolve, reject) => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&scope=email%20profile&redirect_uri=${chrome.identity.getRedirectURL()}&prompt=select_account`

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

export const signIn = async () => {
  try {
    const credential = await getGoogleAuthCredential()
    console.log('credential', credential)
    const result = await signInWithCredential(auth, credential)
    console.log('result', result)
    return result.user
  } catch (e) {
    console.error(e)
    return null
  }
}
