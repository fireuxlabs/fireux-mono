import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalInterface(
  profileRef?: Ref<ProfessionalProfile | null | undefined>
) {
  const resolve = () => profileRef?.value ?? null
  const toLink = (id?: string) => (id ? `/profiles/${id}` : '')
  const avatar = () => {
    const profile = resolve()
    return profile?.avatar_url ?? profile?.avatar ?? ''
  }
  const title = () => {
    const profile = resolve()
    return profile?.title ?? profile?.display_name ?? ''
  }
  const badges = () => {
    const profile = resolve()
    return (
      profile?.health_certifications ??
      profile?.specialties ??
      profile?.badges ??
      []
    )
  }

  const toPill = (): Pill.Props => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      avatar: avatar(),
      initials: 'A',
      title: title(),
      subtitle: 'professional',
      badges: badges(),
      to: toLink(id),
    }
  }

  const toCell = (): ProfessionalCard.Cell => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      id,
      display_name: profile?.display_name ?? profile?.title ?? '',
      avatar: avatar(),
      title: profile?.title ?? '',
      subtitle: profile?.subtitle ?? '',
      badges: profile?.badges ?? [],
      bio_short: profile?.bio_short ?? '',
      specialties: profile?.specialties ?? [],
      to: toLink(id),
    }
  }

  const toProfile = (): ProfessionalCard.Profile => {
    const profile = resolve()
    return { ...toCell(), bio_long: profile?.bio_long ?? '' }
  }

  return { toPill, toCell, toProfile }
}
