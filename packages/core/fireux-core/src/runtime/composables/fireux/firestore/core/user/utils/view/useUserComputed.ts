import { computed } from '#imports'
import { useAuth } from '../../../../../firebase/useAuth'
import type {
  User,
  AppUser,
} from '../../../../../../../models/core/user.model'
import type { UserRefs } from '../../fetch/useUserFetch'

type UserCtaKey = 'sign-in' | 'avatar'

type UserCta = {
  key: UserCtaKey
  label: string
  to: string
}

const CTA_SIGN_IN: UserCta = { key: 'sign-in', label: 'Sign in', to: '/auth' }
const CTA_AVATAR: UserCta = { key: 'avatar', label: '', to: '' }

export function useUserComputed(user: UserRefs, pending?: { value?: boolean }) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  const { uid, isAuthenticated } = useAuth()

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () => isPending.value || coreUser.value === undefined
  )
  const currentUser = computed(() => coreUser.value ?? null)
  const hasCoreProfile = computed(() => Boolean(coreUser.value))

  const profileComplete = computed<number | null>(() => {
    const current = coreUser.value
    if (current === undefined) return null
    if (current === null) return 0

    const checks = [
      Boolean((current.display_name ?? '').trim()),
      Boolean((current.handle ?? '').trim()),
      Boolean((current.bio ?? '').trim()),
      Boolean((current.avatar ?? '').trim()),
    ]

    const total = checks.length
    const done = checks.filter(Boolean).length
    return Math.round((done / total) * 100)
  })

  const isAdmin = computed(() => {
    if (coreUser.value?.role === 'admin') return true
    return appUser.value?.role === 'admin'
  })

  const cta = computed((): UserCta =>
    isAuthenticated.value && uid.value ? CTA_AVATAR : CTA_SIGN_IN
  )

  const hasProfile = (profileType: string) => {
    const key = (profileType ?? '').trim()
    if (!key) return false

    const profiles = coreUser.value?.profiles
    if (!Array.isArray(profiles)) return false

    return profiles.includes(key)
  }

  return {
    currentUser,
    isLoading,
    isPending,
    hasCoreProfile,
    profileComplete,
    isAdmin,
    cta,
    hasProfile,
  }
}
