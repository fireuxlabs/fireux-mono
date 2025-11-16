import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  supplierConfig,
  type SupplierProfile,
  type SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

const DEFAULT_INITIALS = 'A'
const toLink = (id?: string | null) => (id ? `/profiles/${id}` : '')

const initialsFrom = (source?: string | null) => {
  const value = (source ?? '').trim()
  return value ? value.charAt(0).toUpperCase() : DEFAULT_INITIALS
}

export function useSupplierInterface(
  profile: ProfileRefs<SupplierProfile>,
  user: Ref<User | null>
) {
  const core = () => profile.coreProfile.value ?? null
  const appOverlay = () => profile.appProfile.value ?? null

  const pill = computed<SupplierCard.Pill | null>(() => {
    const value = user.value
    if (!value) return null

    return {
      avatar: value.avatar ?? '',
      title: value.display_name ?? '',
      subtitle: value.handle ? `@${value.handle}` : '',
      to: `/${supplierConfig.collectionName}/${value.id}`,
    }
  })

  const derive = (target?: SupplierProfile | null) => {
    const overlay: Partial<SupplierProfile> | null =
      target ?? appOverlay() ?? null
    const base: Partial<SupplierProfile> | null = target ? null : core()

    const pick = <T>(
      selector: (p: Partial<SupplierProfile>) => T | null | undefined
    ): T | undefined =>
      (overlay && selector(overlay)) ?? (base && selector(base)) ?? undefined

    const id = pick((p) => p.id) ?? ''
    const fallbackTitle = user.value?.display_name ?? 'Supplier'
    const fallbackSubtitle = user.value?.handle ?? 'supplier'
    const title = pick((p) => p.title) ?? fallbackTitle
    const subtitle = pick((p) => p.subtitle) ?? fallbackSubtitle
    const avatar = pick((p) => p.avatar_url) ?? pick((p) => p.avatar) ?? ''
    const badgesCandidate =
      pick((p) => p.categories) ??
      pick((p) => p.specialties) ??
      pick((p) => p.badges)
    const specialtiesCandidate = pick((p) => p.specialties)
    const categoriesCandidate = pick((p) => p.categories)
    const badges = Array.isArray(badgesCandidate) ? badgesCandidate : []
    const specialties = Array.isArray(specialtiesCandidate)
      ? specialtiesCandidate
      : []
    const categories = Array.isArray(categoriesCandidate)
      ? categoriesCandidate
      : []
    const bioShort = pick((p) => p.bio_short) ?? ''
    const bioLong = pick((p) => p.bio_long) ?? ''

    return {
      id,
      title,
      subtitle,
      avatar,
      badges,
      specialties,
      categories,
      bioShort,
      bioLong,
    }
  }

  const pillProps = (target?: SupplierProfile | null): SupplierCard.Pill => {
    const derived = derive(target)
    return {
      avatar: derived.avatar,
      initials: initialsFrom(derived.title),
      title: derived.title,
      subtitle: derived.subtitle,
      badges: derived.badges,
      to: derived.id ? toLink(derived.id) : null,
    }
  }

  const cellProps = (target?: SupplierProfile | null): SupplierCard.Cell => {
    const derived = derive(target)
    return {
      ...pillProps(target),
      id: derived.id,
      to: derived.id ? toLink(derived.id) : undefined,
      bio_short: derived.bioShort,
      specialties: derived.specialties,
      categories: derived.categories,
    }
  }

  const profileProps = (
    target?: SupplierProfile | null
  ): SupplierCard.Profile => {
    const derived = derive(target)
    return {
      ...cellProps(target),
      bio_long: derived.bioLong,
    }
  }

  return { pill, pillProps, cellProps, profileProps }
}
