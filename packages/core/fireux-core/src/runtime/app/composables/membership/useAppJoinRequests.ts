import { computed, type ComputedRef } from 'vue'
import type { AppUserJoinRequestSummary } from '../../models/app-user-summary.ts'
import type { UserIdentitySummary } from '../../../user/models/user-directory.model.ts'
import type { UserCard } from '../../../user/composables/useUserView'

type JoinRequestItem = {
  id: string
  title: string
  subtitle?: string
  avatar: string
  to: string
}

type HandleJoinRequests = (uid: string, approve: boolean) => Promise<unknown>

type CardBuilder = ComputedRef<
  (target?: UserIdentitySummary | null | undefined) => UserCard
>

type Options = {
  requests: ComputedRef<AppUserJoinRequestSummary[]>
  handleJoinRequests: HandleJoinRequests
  card: CardBuilder
}

/** Maps the bounded App-admin join-request projection to list items. */
export function useAppJoinRequests(options: Options): {
  items: ComputedRef<JoinRequestItem[]>
  approve: (uid: string) => Promise<unknown>
  reject: (uid: string) => Promise<unknown>
} {
  const { requests, handleJoinRequests, card } = options

  const buildItem = (request: AppUserJoinRequestSummary): JoinRequestItem => {
    const profile = request.user
    if (!profile) {
      return {
        id: request.id,
        title: request.id,
        subtitle: '',
        avatar: '',
        to: '',
      }
    }

    const payload = card.value(profile)
    return {
      id: request.id,
      title: payload.displayName,
      subtitle: payload.handle,
      avatar: payload.avatarUrl,
      to: payload.to,
    }
  }

  const items = computed(() => requests.value.map(buildItem))

  return {
    items,
    approve: (uid: string) => handleJoinRequests(uid, true),
    reject: (uid: string) => handleJoinRequests(uid, false),
  }
}

export type { JoinRequestItem }
