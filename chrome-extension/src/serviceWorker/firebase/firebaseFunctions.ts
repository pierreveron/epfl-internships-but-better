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

export const cleanData = httpsCallable(functions, 'clean_data')
export const getUserData = httpsCallable(functions, 'get_user_data')
export const getUpgradeUrl = httpsCallable(functions, 'get_upgrade_url')
