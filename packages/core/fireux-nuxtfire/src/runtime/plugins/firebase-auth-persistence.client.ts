import { defineNuxtPlugin } from '#imports'
import { getApps } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth'

export default defineNuxtPlugin(async () => {
  // NuxtFire owns the default App. The module appends this plugin after
  // NuxtFire's client initializer; keep this guard so HMR can never turn a
  // transient plugin-order state into a fatal application error.
  if (!getApps().length) return

  // Authentication is an explicit user-requested feature and must survive
  // reloads and browser restarts until the user signs out or clears site data.
  // Keep this as one shared Core policy rather than an App-specific delta.
  await setPersistence(getAuth(), browserLocalPersistence)
})
