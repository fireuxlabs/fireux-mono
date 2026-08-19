import { computed } from 'vue'
import { useAuth } from '../firebase/useAuth'

export type ConsoleAuthPhase = 'loading' | 'guest' | 'signed-in'

const AUTH_WAIT_TIMEOUT_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitFor(ready: () => boolean, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs
  while (!ready() && Date.now() < deadline) {
    await sleep(50)
  }
}

export function useConsoleEntryState() {
  const { uid, isAuthenticated, hasAuthState } = useAuth()

  const authPhase = computed<ConsoleAuthPhase>(() => {
    if (!hasAuthState.value) return 'loading'
    return isAuthenticated.value ? 'signed-in' : 'guest'
  })

  const isSignedIn = computed(() => authPhase.value === 'signed-in')
  const isGuest = computed(() => authPhase.value === 'guest')
  const isLoading = computed(() => authPhase.value === 'loading')
  const waitForAuthResolution = async (timeoutMs = AUTH_WAIT_TIMEOUT_MS) => {
    if (import.meta.server) return
    await waitFor(() => hasAuthState.value, timeoutMs)
  }

  return {
    uid,
    hasAuthState,
    authPhase,
    isSignedIn,
    isGuest,
    isLoading,
    waitForAuthResolution,
  }
}
