import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'
import { useUser } from '../../firestore/core/user/useUser'
import { useAppEnsure } from '../../firestore/core/app/mutations/useAppEnsure'
import { ensureUserAppMembership } from '../../firestore/core/user/utils/ensureHelpers'
import type { EnvCheckResponse } from '../../../../../types/app/onboarding'
import { useAppEnvCheck } from './useAppEnvCheck'
import { useImageStorage } from '../../firebase/useImageStorage'
import { useFirestoreUpdate } from '../../firestore/operations/useFirestoreUpdate'
import { deleteField } from 'firebase/firestore'
import {
  appImageFirestoreField,
  appImageStoragePath,
  type AppImageKind,
} from '../../firestore/core/app/utils/appMedia'

export interface AppOnboardingState {
  coreUser: Ref<ReturnType<typeof useUser>['coreUser']['value'] | null>
  isUnlocked: Ref<boolean>
  pin: Ref<number[]>
  pinError: Ref<string | null>
  pinLength: Ref<number>
  expectedPin: Ref<string>
  env: Ref<EnvCheckResponse | null>
  envError: Ref<string | null>
  pending: Ref<boolean>
  canProceed: Ref<boolean>
  bypassWarning: Ref<boolean>
  checkPin: () => void
  onRefreshEnv: () => void
  onProceed: () => Promise<void>
}

export function useAppOnboarding(): AppOnboardingState {
  const { developerPin, devMode } = useFireUXConfig()
  const { appId } = useFireUXConfig()
  const isDev = import.meta.dev

  const expectedPin = computed(() => {
    const raw = typeof developerPin === 'string' ? developerPin.trim() : ''
    const digits = raw.replaceAll(/\D/g, '')
    return digits || '1234'
  })

  const pinLength = computed(() => expectedPin.value.length)

  const { coreUser: coreUserRef } = useUser()
  const coreUser = computed(() => coreUserRef.value ?? null)

  const pin = ref<number[]>([])
  const pinError = ref<string | null>(null)
  const isUnlocked = ref(false)

  const resetPin = () => {
    pin.value = []
  }

  const checkPin = () => {
    const entry = pin.value.join('')
    if (isDev) {
      console.info('[onboarding] checkPin', {
        entry,
        expected: expectedPin.value,
      })
    }
    if (entry === expectedPin.value) {
      isUnlocked.value = true
      pinError.value = null
    } else {
      pinError.value = 'Incorrect PIN. Try again.'
    }
    resetPin()
  }

  watch(coreUser, (value: typeof coreUser.value) => {
    if (!value) {
      isUnlocked.value = false
      pinError.value = null
      resetPin()
    }
  })

  const { data, pending, error, refresh: refreshEnv } = useAppEnvCheck()

  const env = computed(() => data.value ?? null)
  const envError = computed(() => {
    if (!error.value) return null
    if (error.value instanceof Error) return error.value.message
    return String(error.value)
  })

  const envPending = computed(() => Boolean(pending.value))
  const canProceed = computed(
    () => Boolean(env.value?.isValid) || Boolean(devMode)
  )
  const bypassWarning = computed(() => !env.value?.isValid && Boolean(devMode))

  const { ensureApp } = useAppEnsure()
  const { uploadImage } = useImageStorage()
  const { updateDocument } = useFirestoreUpdate()

  function cacheBust(url: string): string {
    const stamp = Date.now().toString(36)
    return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
  }

  const syncNewAppImages = async (appId: string) => {
    // Only sync when env-check says local assets are present/valid.
    // This keeps the onboarding flow safe when devMode bypass is used.
    if (!env.value?.isValid) return

    const uploads: Array<{ kind: AppImageKind; localPath: string }> = [
      { kind: 'logo', localPath: '/img/app/logo.png' },
      { kind: 'wordmarkLight', localPath: '/img/app/wordmark-light.png' },
      { kind: 'wordmarkDark', localPath: '/img/app/wordmark-dark.png' },
      { kind: 'thumbnail', localPath: '/img/app/thumbnail.png' },
    ]

    const patch: Record<string, string> = {}
    for (const item of uploads) {
      const storagePath = appImageStoragePath(appId, item.kind)
      const field = appImageFirestoreField(item.kind)
      const url = await uploadImage(storagePath, item.localPath)
      patch[field] = cacheBust(url)
    }

    await updateDocument('apps', appId, {
      ...patch,
      // Ensure no legacy wordmark field can linger.
      wordmark_url: deleteField(),
      // Ensure legacy thumbnail field is removed.
      avatar_url: '',
    })
  }

  const onRefreshEnv = () => {
    void refreshEnv()
  }

  const onProceed = async () => {
    if (!canProceed.value) return
    try {
      const ensured = await ensureApp()
      console.log('[proceed] ensureApp result', ensured)

      // Self-heal existing apps stuck in "not initialized" when admin mirrors are empty.
      // After PIN, the current signed-in user becomes the app admin for onboarding.
      const currentUid = String(coreUser.value?.id ?? '').trim()
      if (currentUid && appId) {
        await ensureUserAppMembership(appId, currentUid, 'admin')
      }

      // For newly-created apps, push the canonical local brand assets to Storage
      // and persist the corresponding URLs in Firestore.
      if (ensured?.created) {
        await syncNewAppImages(ensured.id)
      }
    } catch (e) {
      console.error('[proceed] ensureApp failed', e)
    }
  }

  return {
    coreUser,
    isUnlocked,
    pin,
    pinError,
    pinLength,
    env,
    envError,
    pending: envPending,
    canProceed,
    bypassWarning,
    expectedPin,
    checkPin,
    onRefreshEnv,
    onProceed,
  }
}
