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

  const port = Number(emulatorPort)
  if (!apiKey || !appId || projectId !== 'demo-fireux-blank' ||
    (databaseId && databaseId !== '(default)') || emulatorHost !== '127.0.0.1' ||
    !Number.isInteger(port) || port < 1 || port > 65535) return

  const app = initializeApp({ apiKey, appId, projectId })
  const firestore = getFirestore(app)
  connectFirestoreEmulator(firestore, emulatorHost, port)

  return { provide: { firestore } }
})
