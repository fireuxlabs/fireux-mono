import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type { ChefProfile } from '../../../../../models/profiles/Chef.model.ts'

type ChefCell = {
  id: string
  title: string
  subtitle: string
  avatar_url: string
  badges: string[]
  to?: string
}

export function useChefInterface(profile: Ref<ChefProfile | null | undefined>) {
  const resolveAvatar = (value: ChefProfile | null | undefined) =>
    ((value as any)?.avatar_url ?? (value as any)?.avatar ?? '') as string

  const toStringArray = (source: unknown): string[] => {
    if (!Array.isArray(source)) return []
    return source.filter(
      (entry): entry is string => typeof entry === 'string' && entry.length > 0
    )
  }

  const resolveBadges = (value: ChefProfile | null | undefined) =>
    toStringArray(value?.specialties ?? value?.badges)

  const toHref = (id: string) => (id ? `/profiles/${id}` : '')

  const toPill = (): Pill.Props => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      avatar: resolveAvatar(value),
      initials: 'A',
      title: value?.title ?? '',
      subtitle: 'chef',
      badges: resolveBadges(value),
      to: toHref(id),
    }
  }

  const toCell = (): ChefCell => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      id,
      title: value?.title ?? '',
      subtitle: 'chef',
      avatar_url: resolveAvatar(value),
      badges: resolveBadges(value),
      to: toHref(id) || undefined,
    }
  }

  const toProfile = (): ChefCell => toCell()

  return { toPill, toCell, toProfile }
}
