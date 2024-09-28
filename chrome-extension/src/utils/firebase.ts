import { getFunctions, connectFunctionsEmulator, Functions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'

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

export const cleanSalaries = httpsCallable(functions, 'clean_salaries')
export const cleanLocations = httpsCallable(functions, 'clean_locations')
