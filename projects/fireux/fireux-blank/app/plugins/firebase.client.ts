import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const {
    apiKey,
    appId,
    projectId,
    databaseId,
    emulatorHost,
    emulatorPort,
  } = useRuntimeConfig().public.firebase

  if (!apiKey && !appId && !projectId && !databaseId && !emulatorHost && !emulatorPort) return
  if (!apiKey || !appId || !projectId) {
    throw new Error('Blank Firebase requires an API key, App ID and project ID.')
  }

  const port = Number(emulatorPort)
  if ((emulatorHost || emulatorPort) &&
    (!emulatorHost || !Number.isInteger(port) || port < 1 || port > 65535)) {
    throw new Error('Blank Firestore emulator requires a host and a valid port.')
  }

  const app = initializeApp({ apiKey, appId, projectId })
  const firestore = databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app)

  if (emulatorHost) connectFirestoreEmulator(firestore, emulatorHost, port)

  return { provide: { firestore } }
})
