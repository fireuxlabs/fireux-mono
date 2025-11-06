import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type {
  ChefProfile,
  ChefCard,
} from '../../../../../models/profiles/Chef.model.ts'

export function useChefInterface(
  profileRef?: Ref<ChefProfile | null | undefined>
) {
  const resolve = () => profileRef?.value ?? null
  const toLink = (id?: string) => (id ? `/profiles/${id}` : '')
  const avatar = () => {
    const profile = resolve()
    return profile?.avatar_url ?? profile?.avatar ?? ''
  }
  const badges = () => {
    const profile = resolve()
    return profile?.specialties ?? profile?.badges ?? []
  }

  const toPill = (): Pill.Props => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      avatar: avatar(),
      initials: 'A',
      title: profile?.title ?? '',
      subtitle: 'chef',
      badges: badges(),
      to: toLink(id),
    }
  }

  const toCell = (): ChefCard.Cell => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      id,
      display_name: profile?.title ?? '',
      avatar: avatar(),
      title: profile?.title ?? '',
      bio_short: profile?.bio_short ?? '',
      specialties: profile?.specialties ?? [],
      to: toLink(id),
    }
  }

  const toProfile = (): ChefCard.Profile => {
    const profile = resolve()
    return { ...toCell(), bio_long: profile?.bio_long ?? '' }
  }

  return { toPill, toCell, toProfile }
}
