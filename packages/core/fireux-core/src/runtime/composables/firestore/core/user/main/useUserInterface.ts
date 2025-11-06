// FILE: ~/composables/user/useUserInterface.ts
import type { Ref } from 'vue'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

export function useUserInterface(
  user: Ref<User | null | undefined> | UserRefs
) {
  const core =
    (user as UserRefs).coreUser?.value ??
    (user as Ref<User | null | undefined>)?.value ??
    null

  const app = (user as UserRefs).appUser?.value as AppUser | undefined

  if (app) {
    // overlay merge reserved for future tenant overlays
  }

  const toPill = (): Pill.Props => {
    const overlay = app as unknown as Partial<User> | undefined
    const source = overlay ?? core

    return {
      avatar: overlay?.avatar ?? core?.avatar ?? '',
      initials: 'A',
      title: source?.display_name ?? '',
      subtitle: source?.handle ? `@${source.handle}` : '',
      badges: source?.profiles ?? [],
      to: source?.id ? `/users/${source.id}` : '',
    }
  }

  return { toPill }
}
