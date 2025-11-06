import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

type ProfessionalCell = {
  id: string
  title: string
  subtitle: string
  avatar_url: string
  badges: string[]
  to?: string
}

const SUBTITLE = 'professional'

const toStringArray = (source: unknown): string[] => {
  if (!Array.isArray(source)) return []
  return source.filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
}

const resolveAvatar = (value: ProfessionalProfile | null | undefined) =>
  ((value as any)?.avatar_url ?? (value as any)?.avatar ?? '') as string

export function useProfessionalInterface(
  profile: Ref<ProfessionalProfile | null | undefined>
) {
  const toHref = (id: string) => (id ? `/profiles/${id}` : '')

  const resolveBadges = (value: ProfessionalProfile | null | undefined) =>
    toStringArray(value?.badges ?? value?.specialties)

  const toPill = (): Pill.Props => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      avatar: resolveAvatar(value),
      initials: 'A',
      title: value?.title ?? value?.display_name ?? '',
      subtitle: SUBTITLE,
      badges: resolveBadges(value),
      to: toHref(id),
    }
  }

  const toCell = (): ProfessionalCell => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      id,
      title: value?.title ?? value?.display_name ?? '',
      subtitle: SUBTITLE,
      avatar_url: resolveAvatar(value),
      badges: resolveBadges(value),
      to: toHref(id) || undefined,
    }
  }

  const toProfile = (): ProfessionalCell => toCell()

  return { toPill, toCell, toProfile }
}
