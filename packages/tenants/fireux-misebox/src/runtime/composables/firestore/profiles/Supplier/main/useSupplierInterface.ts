import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier.model.ts'

type SupplierCell = {
  id: string
  title: string
  subtitle: string
  avatar_url: string
  badges: string[]
  to?: string
}

const SUBTITLE = 'supplier'

const toStringArray = (source: unknown): string[] => {
  if (!Array.isArray(source)) return []
  return source.filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
}

const resolveAvatar = (value: SupplierProfile | null | undefined) =>
  ((value as any)?.avatar_url ?? (value as any)?.avatar ?? '') as string

export function useSupplierInterface(
  profile: Ref<SupplierProfile | null | undefined>
) {
  const toHref = (id: string) => (id ? `/profiles/${id}` : '')

  const resolveBadges = (value: SupplierProfile | null | undefined) =>
    toStringArray(value?.specialties ?? value?.badges)

  const toPill = (): Pill.Props => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      avatar: resolveAvatar(value),
      initials: 'A',
      title: value?.title ?? '',
      subtitle: SUBTITLE,
      badges: resolveBadges(value),
      to: toHref(id),
    }
  }

  const toCell = (): SupplierCell => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      id,
      title: value?.title ?? '',
      subtitle: SUBTITLE,
      avatar_url: resolveAvatar(value),
      badges: resolveBadges(value),
      to: toHref(id) || undefined,
    }
  }

  const toProfile = (): SupplierCell => toCell()

  return { toPill, toCell, toProfile }
}
