import type { Ref } from 'vue'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type {
  SupplierProfile,
  SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'

export function useSupplierInterface(
  profileRef?: Ref<SupplierProfile | null | undefined>
) {
  const resolve = () => profileRef?.value ?? null
  const toLink = (id?: string) => (id ? `/profiles/${id}` : '')
  const avatar = () => {
    const profile = resolve()
    return profile?.avatar_url ?? profile?.avatar ?? ''
  }
  const badges = () => {
    const profile = resolve()
    return profile?.categories ?? profile?.specialties ?? profile?.badges ?? []
  }

  const toPill = (): Pill.Props => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      avatar: avatar(),
      initials: 'A',
      title: profile?.title ?? '',
      subtitle: 'supplier',
      badges: badges(),
      to: toLink(id),
    }
  }

  const toCell = (): SupplierCard.Cell => {
    const profile = resolve()
    const id = profile?.id ?? ''

    return {
      id,
      display_name: profile?.title ?? '',
      avatar: avatar(),
      title: profile?.title ?? '',
      bio_short: profile?.bio_short ?? '',
      specialties: profile?.specialties ?? profile?.categories ?? [],
      to: toLink(id),
    }
  }

  const toProfile = (): SupplierCard.Profile => {
    const profile = resolve()
    return { ...toCell(), bio_long: profile?.bio_long ?? '' }
  }

  return { toPill, toCell, toProfile }
}
