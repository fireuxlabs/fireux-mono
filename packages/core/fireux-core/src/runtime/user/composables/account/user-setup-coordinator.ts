import type { Ref } from 'vue'
import type { User } from 'firebase/auth'
import { provisionSignedInUserAccount } from '../../utils/provision-user-account'

export type UserSetupState = {
  uid: string | null
  status: 'idle' | 'pending' | 'success' | 'failed'
  generation: number
}

type UserSetupFlight = {
  generation: number
  promise: Promise<void>
}

type UserSetupCoordinatorOptions = {
  currentUser: Ref<User | null>
  isReady: Ref<boolean>
  state: Ref<UserSetupState>
  lastError: Ref<unknown>
  userCreate: {
    bootstrapUser: (user?: User, isCurrent?: () => boolean) => Promise<unknown>
  } | null
}

export function createUserSetupCoordinator(
  options: UserSetupCoordinatorOptions
) {
  const flights = new Map<string, UserSetupFlight>()
  const { currentUser, isReady, state, lastError, userCreate } = options

  const createOnce = async (
    nextUid: string | null,
    createOptions: { retry?: boolean; termsVersion?: string } = {}
  ) => {
    if (
      !import.meta.client ||
      !nextUid ||
      currentUser.value?.isAnonymous ||
      currentUser.value?.uid !== nextUid ||
      !isReady.value
    )
      return

    const activeFlight = flights.get(nextUid)
    if (activeFlight) {
      await activeFlight.promise
      return
    }
    if (!userCreate) return

    const currentState = state.value
    if (currentState.uid === nextUid) {
      if (currentState.status === 'success') return
      if (currentState.status === 'failed' && !createOptions.retry) {
        if (lastError.value) throw lastError.value
        return
      }
    }

    const generation = currentState.generation + 1
    state.value = { uid: nextUid, status: 'pending', generation }
    lastError.value = null
    const isCurrent = () =>
      currentUser.value?.uid === nextUid &&
      state.value.uid === nextUid &&
      state.value.generation === generation
    const promise = (async () => {
      try {
        const signedInUser = currentUser.value
        if (!signedInUser || signedInUser.uid !== nextUid) return
        await provisionSignedInUserAccount(
          signedInUser,
          createOptions.termsVersion
        )
        if (!isCurrent()) return
        await userCreate.bootstrapUser(signedInUser, isCurrent)
        if (isCurrent()) {
          state.value = { uid: nextUid, status: 'success', generation }
        }
      } catch (error) {
        if (!isCurrent()) return
        state.value = { uid: nextUid, status: 'failed', generation }
        lastError.value = error
        throw error
      }
    })()
    const flight = { generation, promise }
    flights.set(nextUid, flight)
    try {
      await promise
    } finally {
      if (flights.get(nextUid) === flight) flights.delete(nextUid)
    }
  }

  const retry = async (termsVersion?: string) => {
    const nextUid = currentUser.value?.uid ?? null
    if (!nextUid) return false
    await createOnce(nextUid, { retry: true, termsVersion })
    return state.value.uid === nextUid && state.value.status === 'success'
  }
  const reset = () => {
    state.value = {
      uid: null,
      status: 'idle',
      generation: state.value.generation + 1,
    }
    flights.clear()
    lastError.value = null
  }
  return { createOnce, retry, reset }
}
