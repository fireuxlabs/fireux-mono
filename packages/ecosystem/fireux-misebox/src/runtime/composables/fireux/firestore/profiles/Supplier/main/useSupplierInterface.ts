import { computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import {
  supplierConfig,
  type SupplierCore,
} from '../../../../../../models/profiles/Supplier/Supplier.model'

/**
 * UI-only view models for Supplier profiles.
 * Keep these out of the Firestore model file.
 */
export namespace SupplierCard {
  /** Pill shape */
  export interface Pill {
    avatar?: string
    title?: string
    subtitle?: string
    tagline?: string
    badges?: string[]
    to?: string
    company_name?: string
    company_avatar?: string
  }

  /** Cell shape */
  export interface Cell extends Pill {
    id?: string
    bio_short?: string | null
    specialties?: string[]
    categories?: string[]
  }

  /** Full profile surface for display components */
  export type Profile = SupplierCore
}

const routeFor = (id?: string | null): string | undefined =>
  id ? `/${supplierConfig.collectionName}/${id}` : undefined

/**
 * Minimal supplier interface.
 * No merging, no overrides.
 * Pill = user.avatar + user.display_name + profile tagline.
 */
export function useSupplierInterface(
  profile: ProfileRefs<SupplierCore>,
  user: Ref<User | null | undefined>
) {
  const resolveProfile = (target?: SupplierCore | null) =>
    target ?? profile.coreProfile.value ?? null

  const resolveUser = (target?: SupplierCore | null) =>
    target?.user ?? user.value ?? null

  const resolveTagline = (
    payload: SupplierCore | null | undefined
  ): string =>
    payload?.tagline?.trim() ??
    (payload as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    ''

  const resolveTitle = (u: Partial<User>) =>
    u.display_name?.trim() ||
    u.email?.trim() ||
    (u.handle ? `@${u.handle.trim()}` : '') ||
    'Supplier'

  const pillProps = (
    target?: SupplierCore | null
  ): SupplierCard.Pill | null => {
    const currentProfile = resolveProfile(target)
    const currentUser = resolveUser(target)
    if (!currentUser) return null

    const tagline = resolveTagline(currentProfile)
    const to = routeFor(currentProfile?.id ?? currentUser.id)

    return {
      avatar: currentUser.avatar ?? '',
      title: resolveTitle(currentUser),
      subtitle: tagline,
      tagline,
      badges: currentProfile?.badges ?? [],
      to,
    }
  }

  const cellProps = (
    target?: SupplierCore | null
  ): SupplierCard.Cell | null => {
    const base = pillProps(target)
    if (!base) return null

    const currentProfile = resolveProfile(target)
    const id = currentProfile?.id ?? resolveUser(target)?.id ?? undefined

    return {
      ...base,
      id,
      bio_short: currentProfile?.bio_short ?? null,
    }
  }

  const pill = computed(() => pillProps())
  const cell = computed(() => cellProps())

  return { pill, cell, pillProps, cellProps }
}

export const resolveSupplierCell = (
  profile?: SupplierCore | null,
  fallbackId = 'supplier-profile'
): SupplierCard.Cell | null => {
  if (!profile) return null

  const user = profile.user ?? undefined
  const id = profile.id ?? user?.id ?? fallbackId

  const subtitle = profile.subtitle ?? undefined
  const tagline =
    (profile as { tagline?: string | null } | null)?.tagline ?? undefined

  const companyAvatar =
    (profile as { avatar?: string | null; avatar_url?: string | null } | null)
      ?.avatar ??
    (profile as { avatar?: string | null; avatar_url?: string | null } | null)
      ?.avatar_url ??
    user?.avatar ??
    undefined

  const companyName =
    (profile as { organization_name?: string | null } | null)
      ?.organization_name ??
    profile.title ??
    user?.display_name ??
    'Supplier'

  return {
    id,
    avatar: user?.avatar ?? undefined,
    title: user?.display_name ?? profile.title ?? 'Supplier',
    subtitle,
    tagline,
    badges: profile.badges ?? [],
    bio_short: (profile as { bio_short?: string | null } | null)?.bio_short ?? null,
    specialties: (profile as { specialties?: string[] } | null)?.specialties ?? [],
    categories: (profile as { categories?: string[] } | null)?.categories ?? [],
    company_name: companyName,
    company_avatar: companyAvatar ?? undefined,
    to: routeFor(profile.id),
  }
}

export const resolveSupplierPill = (
  profile?: SupplierCore | null
): SupplierCard.Pill => ({
  avatar: profile?.user?.avatar ?? '',
  title: profile?.user?.display_name ?? '',
  subtitle:
    profile?.tagline?.trim() ??
    (profile as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    '',
  tagline:
    profile?.tagline?.trim() ??
    (profile as { subtitle?: string | null } | null)?.subtitle?.trim() ??
    '',
  badges: [],
  to: routeFor(profile?.id),
})

export const resolveSupplierPillKey = (pill: SupplierCard.Pill) =>
  pill.to ?? pill.title ?? 'supplier'
