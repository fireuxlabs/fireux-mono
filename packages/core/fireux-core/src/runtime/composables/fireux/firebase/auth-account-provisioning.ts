import { refreshNuxtData } from '#imports'
import { computed, type Ref } from 'vue'
import type { User } from 'firebase/auth'
import {
  clearPendingAccountConsent,
  readPendingAccountConsent,
} from './account-consent'
import { provisionSignedInUserAccount } from './userAccountProvisioning'
import { CURRENT_USER_ACCOUNT_ASYNC_DATA_KEY } from '../user/currentUserAccount'

export type AccountProvisionState = {
  uid: string | null
  status: 'idle' | 'pending' | 'success' | 'failed'
  generation: number
}

type AccountProvisionFlight = {
  generation: number
  promise: Promise<void>
}

type AccountProvisionerOptions = {
  currentUser: Ref<User | null>
  isReady: Ref<boolean>
  state: Ref<AccountProvisionState>
  lastError: Ref<unknown>
  userCreate: { createUser: () => Promise<unknown> } | null
}

const flights = new Map<string, AccountProvisionFlight>()

export function createAuthAccountProvisioner(options: AccountProvisionerOptions) {
  const { currentUser, isReady, state, lastError, userCreate } = options

  const createOnce = async (
    nextUid: string | null,
    createOptions: { retry?: boolean } = {}
  ) => {
    if (
      !import.meta.client ||
      !nextUid ||
      currentUser.value?.isAnonymous ||
      currentUser.value?.uid !== nextUid ||
      !isReady.value
    ) return

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
    const promise = (async () => {
      try {
        const signedInUser = currentUser.value
        if (!signedInUser || signedInUser.uid !== nextUid) return
        const termsVersion = readPendingAccountConsent() ?? undefined
        await provisionSignedInUserAccount(signedInUser, termsVersion)
        await refreshNuxtData(CURRENT_USER_ACCOUNT_ASYNC_DATA_KEY)
        if (termsVersion) clearPendingAccountConsent()
        await userCreate.createUser()
        const nextState = state.value
        if (
          currentUser.value?.uid === nextUid &&
          nextState.uid === nextUid &&
          nextState.generation === generation
        ) {
          state.value = { uid: nextUid, status: 'success', generation }
        }
      } catch (error) {
        const nextState = state.value
        if (
          currentUser.value?.uid === nextUid &&
          nextState.uid === nextUid &&
          nextState.generation === generation
        ) {
          state.value = { uid: nextUid, status: 'failed', generation }
          lastError.value = error
        }
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

  const retry = async () => {
    const nextUid = currentUser.value?.uid ?? null
    if (!nextUid) return false
    await createOnce(nextUid, { retry: true })
    return state.value.uid === nextUid && state.value.status === 'success'
  }
  const reset = (uid: string | null) => {
    state.value = {
      uid: null,
      status: 'idle',
      generation: state.value.generation + 1,
    }
    if (uid) flights.delete(uid)
    lastError.value = null
  }
  const creating = computed(
    () =>
      state.value.uid === currentUser.value?.uid &&
      state.value.status === 'pending'
  )
  return { createOnce, retry, reset, creating }
}
