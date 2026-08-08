import { computed, type Ref } from 'vue'
import { formatFirestoreTimestamp } from '../../../utils/formatTimestamp'
import type { UserCard } from '../user/useUserInterface'
import {
  useAppInterface,
  type AppCard,
  type AppViewSource,
} from './useAppInterface'

const safeString = (value: unknown) => String(value ?? '').trim()

export type AppProfileViewModel = {
  card: AppCard.Card
  description: string
  appId: string
  role: string
  ecosystem: string
  creatorId: string
  creatorCard: UserCard.Card | null
  createdAtText: string
}

export function useAppProfileView(
  appRef: Ref<AppViewSource | null | undefined>
) {
  const { profile: toProfile } = useAppInterface(appRef)
  const creatorId = computed(
    () => safeString(appRef.value?.created?.by) || null
  )
  const card = computed(() => toProfile(appRef.value))
  const creatorCard = computed<UserCard.Card | null>(() => null)
  const createdAtText = computed(
    () =>
      formatFirestoreTimestamp(appRef.value?.created?.at, {
        fallback: '',
        format: { dateStyle: 'medium' },
      }) ?? ''
  )

  const model = computed<AppProfileViewModel | null>(() => {
    if (!card.value) return null

    return {
      card: card.value,
      description: safeString(appRef.value?.description),
      appId: safeString(appRef.value?.id) || card.value.id,
      role: safeString(appRef.value?.role) || card.value.role,
      ecosystem:
        safeString(appRef.value?.ecosystem_id || appRef.value?.ecosystem) ||
        card.value.ecosystem,
      creatorId: creatorId.value ?? '',
      creatorCard: creatorCard.value,
      createdAtText: createdAtText.value,
    }
  })

  return {
    model,
    card,
    creatorCard,
  }
}
