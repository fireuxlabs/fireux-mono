import { computed } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier.model.ts'

export function useSupplierComputed(profile: ProfileRefs<SupplierProfile>) {
  const coreProfile = computed<SupplierProfile | null>(
    () => profile.coreProfile.value ?? null
  )

  const appProfile = computed<Partial<SupplierProfile> | null>(
    () => profile.appProfile.value ?? null
  )

  const activeProfile = computed<SupplierProfile | null>(() => {
    const core = coreProfile.value
    const overlay = appProfile.value
    if (!core && !overlay) return null
    const merged = {} as SupplierProfile
    if (core) Object.assign(merged, core)
    if (overlay) Object.assign(merged, overlay)
    return merged
  })

  const hasCoreProfile = computed(() => Boolean(coreProfile.value))
  const hasAppProfile = computed(() => Boolean(appProfile.value))

  return {
    coreProfile,
    appProfile,
    activeProfile,
    hasCoreProfile,
    hasAppProfile,
  }
}
