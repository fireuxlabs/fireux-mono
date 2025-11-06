import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type {
  EmployerProfile,
  EmployerCard,
} from '../../../../../models/profiles/Employer.model.ts'

export function useEmployerInterface(
  profileRef?: Ref<EmployerProfile | null | undefined>
) {
  const resolve = () => profileRef?.value ?? null
  const toLink = (id?: string) => (id ? `/profiles/${id}` : '')
  const avatar = () => {
    const profile = resolve()
    return profile?.avatar_url ?? profile?.avatar ?? ''
  }
  const title = () => {
    const profile = resolve()
    return profile?.title ?? profile?.organization_name ?? ''
  }
  const badges = () => {
    const profile = resolve()
    return profile?.locations ?? profile?.badges ?? []
  }

  const toPill = (): Pill.Props => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      avatar: avatar(),
      initials: 'A',
      title: title(),
      subtitle: 'employer',
      badges: badges(),
      to: toLink(id),
    }
  }

  const toCell = (): EmployerCard.Cell => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      id,
      display_name: profile?.organization_name ?? profile?.title ?? '',
      avatar: avatar(),
      title: profile?.title ?? '',
      bio_short: profile?.bio_short ?? '',
      specialties: profile?.specialties ?? [],
      to: toLink(id),
    }
  }

  const toProfile = (): EmployerCard.Profile => {
    const profile = resolve()
    return { ...toCell(), bio_long: profile?.bio_long ?? '' }
  }

  return { toPill, toCell, toProfile }
}
