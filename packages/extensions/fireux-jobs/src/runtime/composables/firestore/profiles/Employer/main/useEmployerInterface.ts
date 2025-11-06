import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type { EmployerProfile } from '../../../../../models/profiles/Employer.model.ts'

type EmployerCell = {
  id: string
  title: string
  subtitle: string
  avatar_url: string
  badges: string[]
  to?: string
}

const SUBTITLE = 'employer'

const toStringArray = (source: unknown): string[] => {
  if (!Array.isArray(source)) return []
  return source.filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
}

const resolveAvatar = (value: EmployerProfile | null | undefined) =>
  ((value as any)?.avatar_url ?? (value as any)?.avatar ?? '') as string

export function useEmployerInterface(
  profile: Ref<EmployerProfile | null | undefined>
) {
  const toHref = (id: string) => (id ? `/profiles/${id}` : '')

  const resolveBadges = (value: EmployerProfile | null | undefined) =>
    toStringArray(value?.badges ?? value?.specialties)

  const resolveTitle = (value: EmployerProfile | null | undefined) =>
    value?.title ?? (value as any)?.organization_name ?? ''

  const toPill = (): Pill.Props => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      avatar: resolveAvatar(value),
      initials: 'A',
      title: resolveTitle(value),
      subtitle: SUBTITLE,
      badges: resolveBadges(value),
      to: toHref(id),
    }
  }

  const toCell = (): EmployerCell => {
    const value = profile.value ?? null
    const id = value?.id ?? ''

    return {
      id,
      title: resolveTitle(value),
      subtitle: SUBTITLE,
      avatar_url: resolveAvatar(value),
      badges: resolveBadges(value),
      to: toHref(id) || undefined,
    }
  }

  const toProfile = (): EmployerCell => toCell()

  return { toPill, toCell, toProfile }
}
