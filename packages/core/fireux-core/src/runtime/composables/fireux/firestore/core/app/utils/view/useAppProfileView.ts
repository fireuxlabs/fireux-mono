import { computed, type Ref } from 'vue'
import type { App } from '../../../../../../../models/core/app.model'
import { useAppUserCollection } from '../../../user/fetch/useAppUserCollection'
import { useUserFetch } from '../../../user/fetch/useUserFetch'
import {
  useUserInterface,
  type UserCard,
} from '../../../user/utils/view/useUserInterface'
import { useAppInterface, type AppCard } from './useAppInterface'
import { formatFirestoreTimestamp } from '../../../../../../../utils/formatTimestamp'

const safeString = (value: unknown) => String(value ?? '').trim()

export type AppProfileAdminAvatarItem = {
  id: string
  to: string
  avatarUrl: string
  alt: string
  tooltip: string
}

export type AppProfileViewModel = {
  card: AppCard.Card
  description: string
  appId: string
  role: string
  ecosystem: string
  creatorId: string
  creatorCard: UserCard.Card | null
  adminCount: number
  adminAvatarItems: AppProfileAdminAvatarItem[]
  createdAtText: string
}

export function useAppProfileView(appRef: Ref<App | null | undefined>) {
  const { profile: toProfile } = useAppInterface(appRef)
  const appId = computed(() => safeString(appRef.value?.id) || null)
  const creatorId = computed(
    () => safeString(appRef.value?.created?.by) || null
  )
  const adminIds = computed(() => {
    const raw = appRef.value?.admin_ids
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (value): value is string =>
        typeof value === 'string' && Boolean(value.trim())
    )
  })

  const { user: creatorUser } = useUserFetch(creatorId)
  const { users: appUsers } = useAppUserCollection(appId)
  const { pill: userToCard } = useUserInterface()

  const card = computed(() => toProfile(appRef.value))
  const creatorCard = computed(() => userToCard(creatorUser.value))
  const createdAtText = computed(
    () =>
      formatFirestoreTimestamp(appRef.value?.created?.at, {
        fallback: '',
        format: { dateStyle: 'medium' },
      }) ?? ''
  )

  const adminAvatarItems = computed<AppProfileAdminAvatarItem[]>(() => {
    return adminIds.value.slice(0, 3).map((id) => {
      const adminUser =
        appUsers.value.find((entry) => entry.id === id)?.coreUser ?? null
      const card = adminUser ? userToCard(adminUser) : null
      const displayName = safeString(card?.displayName)
      const handle = safeString(card?.handle)

      return {
        id,
        to: card?.to ?? '',
        avatarUrl: card?.avatarUrl ?? '',
        alt: displayName || handle || id,
        tooltip: displayName || handle || id,
      }
    })
  })

  const model = computed<AppProfileViewModel | null>(() => {
    if (!card.value) return null

    return {
      card: card.value,
      description: safeString(appRef.value?.description),
      appId: safeString(appRef.value?.id) || card.value.id,
      role: safeString(appRef.value?.role) || card.value.role,
      ecosystem: safeString(appRef.value?.ecosystem) || card.value.ecosystem,
      creatorId: creatorId.value ?? '',
      creatorCard: creatorCard.value,
      adminCount: adminIds.value.length,
      adminAvatarItems: adminAvatarItems.value,
      createdAtText: createdAtText.value,
    }
  })

  return {
    model,
    card,
    creatorCard,
    adminAvatarItems,
  }
}
