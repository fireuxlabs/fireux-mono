// FILE: packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface.ts

import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts'
import { supplierConfig, type SupplierCore } from '../../../../../../models/profiles/Supplier/Supplier.model.ts'

export namespace SupplierCard {
  export type Card = {
    id: string
    to: string
    avatar: string
    title: string
    subtitle: string
    badges: string[]
    line1: string
    line2: string
    line3: string
  }
}

export function useSupplierInterface(profile: ProfileRefs<SupplierCore>, user: Ref<User | null | undefined>) {
  const resolveProfile = (target?: SupplierCore) => target || profile.coreProfile.value || undefined
  const resolveUser = (target?: (SupplierCore & { user?: User | null }) | SupplierCore) =>
    (target as any)?.user || user.value || undefined

  const card = (target?: SupplierCore): SupplierCard.Card => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser(target)

    const id = String(currentProfile?.id || currentUser?.id || '').trim()
    const to = id ? `/${supplierConfig.collectionName}/${id}` : ''

    const avatar = String(currentUser?.avatar || '').trim()
    const title = String(currentUser?.display_name || currentUser?.email || 'Supplier').trim() || 'Supplier'

    const tagline = String((currentProfile as any)?.tagline || (currentProfile as any)?.subtitle || '').trim()
    const subtitle = tagline

    const rawBadges = Array.isArray((currentProfile as any)?.badges)
      ? ((currentProfile as any).badges as unknown[])
      : []
    const badges = rawBadges.map((b) => String(b).trim()).filter(Boolean)

    const line1 = String((currentProfile as any)?.bio_short || '').trim()
    const specialties = Array.isArray((currentProfile as any)?.specialties)
      ? ((currentProfile as any).specialties as unknown[]).map((s) => String(s).trim()).filter(Boolean)
      : []
    const line2 = specialties.length ? specialties.join(', ') : ''
    const locations = Array.isArray((currentProfile as any)?.locations)
      ? ((currentProfile as any).locations as unknown[]).map((s) => String(s).trim()).filter(Boolean)
      : []
    const line3 = locations.length ? locations.join(', ') : ''

    return {
      id,
      to,
      avatar,
      title,
      subtitle,
      badges,
      line1,
      line2,
      line3,
    }
  }

  return { card }
}
