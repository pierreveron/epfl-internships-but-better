import { getFunctions, connectFunctionsEmulator, Functions, httpsCallable } from 'firebase/functions'
import { app } from './firebaseApp'

const constants = {
  nodeEnv: import.meta.env.VITE_NODE_ENV,
}

function initializeFunctions(): Functions {
  const functions = getFunctions(app)
  if (constants.nodeEnv === 'development') {
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.log('Connected to Firebase Functions Emulator')
  }

  return functions
}

const functions = initializeFunctions()

export const formatOffers = httpsCallable(functions, 'format_offers')
export const handleSignUp = httpsCallable(functions, 'handle_sign_up')
export const handleSignIn = httpsCallable(functions, 'handle_sign_in')
