import { computed } from '#imports'
import { useAuth } from '../../../../../firebase/useAuth'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { useFirestoreRead } from '../../../../operations/useFirestoreRead'
import type {
  User,
  AppUser,
} from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'

type UserCtaKey = 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'

type UserCta = {
  key: UserCtaKey
  label: string
  to: string
}

const CTA_SIGN_IN: UserCta = { key: 'sign-in', label: 'Sign in', to: '/auth' }
const CTA_CREATE_CORE: UserCta = {
  key: 'create-core-user',
  label: 'Create core user',
  to: '',
}
const CTA_JOIN_APP: UserCta = { key: 'join-app', label: 'Join app', to: '' }
const CTA_AVATAR: UserCta = { key: 'avatar', label: '', to: '' }

type KitchenDoc = {
  id?: string | null
}

type PlaceDoc = {
  id?: string | null
  claimed_by?: string | null
  name?: string | null
  short_name?: string | null
  is_test_kitchen?: boolean | null
  tags?: string[] | null
}

const normalizeKitchenIds = (items: KitchenDoc[]) =>
  new Set(
    (items ?? [])
      .map((kitchen) => String(kitchen.id || '').trim())
      .filter(Boolean)
  )

const normalizePlaceIds = (items: PlaceDoc[], kitchenIdSet: Set<string>) =>
  Array.from(
    new Set(
      (items ?? [])
        .map((place) => String(place.id || '').trim())
        .filter((id) => id && kitchenIdSet.has(id))
    )
  )

const normalizeIds = (items: Array<string | null | undefined>) =>
  Array.from(
    new Set(items.map((id) => String(id || '').trim()).filter(Boolean))
  )

const isTestKitchenPlace = (place: PlaceDoc, currentUid: string) => {
  if (place.is_test_kitchen === true) return true

  const tags = Array.isArray(place.tags)
    ? place.tags.map((tag) => String(tag || '').trim().toLowerCase())
    : []
  if (tags.includes('test-kitchen')) return true

  const placeId = String(place.id || '').trim()
  const placeName = String(place.name || '').trim().toLowerCase()
  const shortName = String(place.short_name || '').trim().toLowerCase()
  const isNamedTest = placeName === 'test kitchen' || shortName === 'test kitchen'

  return placeId === currentUid && isNamedTest
}

export function useUserComputed(user: UserRefs, pending?: { value?: boolean }) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  const { uid, isAuthenticated } = useAuth()
  const { isTenant, appId, modules } = useFireUXConfig()
  const kitchensEnabled = modules.includes('fireux-kitchens')

  const { firestoreFetchCollection } = useFirestoreRead()
  const kitchens = kitchensEnabled
    ? firestoreFetchCollection<KitchenDoc>('kitchens')
    : computed<KitchenDoc[]>(() => [])
  const places = kitchensEnabled
    ? firestoreFetchCollection<PlaceDoc>('places')
    : computed<PlaceDoc[]>(() => [])

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () =>
      isPending.value ||
      coreUser.value === undefined ||
      (isTenant && appUser.value === undefined)
  )

  const isResolved = computed(
    () =>
      !isPending.value &&
      coreUser.value !== undefined &&
      (!isTenant || appUser.value !== undefined)
  )
  const hasCoreUser = computed(() => coreUser.value !== null && coreUser.value !== undefined)
  const hasAppUser = computed(() => appUser.value !== null && appUser.value !== undefined)
  const isInitialized = computed(() => {
    if (!isResolved.value) return false
    if (!hasCoreUser.value) return false
    if (isTenant && !hasAppUser.value) return false
    return true
  })
  const currentUser = computed(() => coreUser.value ?? null)

  const isAdmin = computed(() => {
    if (appUser.value?.role === 'admin') return true

    const activeAppId = appId?.trim()
    if (!activeAppId) return false

    // Fall back to core app membership so admin UI works when app overlay
    // docs are missing or still onboarding.
    return Boolean(coreUser.value?.adminOf?.some((id) => id === activeAppId))
  })

  const cta = computed((): UserCta => {
    if (!isAuthenticated.value || !uid.value) return CTA_SIGN_IN
    if (!isResolved.value) return CTA_AVATAR
    if (!hasCoreUser.value) return CTA_CREATE_CORE
    if (isTenant && !hasAppUser.value) return CTA_JOIN_APP
    return CTA_AVATAR
  })

  const hasProfile = (profileType: string) => {
    const key = (profileType ?? '').trim()
    if (!key) return false

    const profiles = coreUser.value?.profiles
    if (!Array.isArray(profiles)) return false

    return profiles.includes(key)
  }

  const currentUid = computed(() => String(coreUser.value?.id || uid.value || '').trim())

  const kitchenIdSet = computed(() =>
    kitchensEnabled ? normalizeKitchenIds(kitchens.value ?? []) : new Set<string>()
  )

  const claimedPlaces = computed(() => {
    if (!kitchensEnabled) return [] as PlaceDoc[]
    if (!currentUid.value) return [] as PlaceDoc[]

    return (places.value ?? []).filter(
      (place) => String(place.claimed_by || '').trim() === currentUid.value
    )
  })

  const myTestKitchenIds = computed(() => {
    if (!kitchensEnabled) return [] as string[]
    if (!currentUid.value) return [] as string[]

    const testPlaces = claimedPlaces.value.filter((place) =>
      isTestKitchenPlace(place, currentUid.value)
    )
    const ids = normalizeIds(testPlaces.map((place) => place.id))
    const preferredId =
      ids.find((id) => id === currentUid.value) ??
      ids[0] ??
      ''
    return preferredId ? [preferredId] : []
  })

  const myKitchenIds = computed(() => {
    const inKitchenCollection = normalizePlaceIds(claimedPlaces.value, kitchenIdSet.value)
    const hiddenSet = new Set(myTestKitchenIds.value)
    return inKitchenCollection.filter((id) => !hiddenSet.has(id))
  })

  const myClaimedKitchenIds = computed(() => {
    if (!kitchensEnabled) return [] as string[]
    return myKitchenIds.value
  })

  const hasTestKitchen = computed(() => myTestKitchenIds.value.length > 0)

  const myPrimaryKitchenId = computed(
    () => myKitchenIds.value[0] ?? myTestKitchenIds.value[0] ?? ''
  )

  return {
    currentUser,
    isLoading,
    isResolved,
    isInitialized,
    isAdmin,
    cta,
    hasProfile,
    myClaimedKitchenIds,
    myKitchenIds,
    hasTestKitchen,
    myPrimaryKitchenId,
  }
}
