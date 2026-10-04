import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { AppUserSubscription } from '../../models/app-user.model'
import { runAppUserCommand } from '../../utils/runAppUserCommand'

const subscriptions = [
  {
    id: 'free',
    label: 'Free',
    icon: 'i-lucide-user-round',
    color: 'neutral',
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: 'i-lucide-crown',
    color: 'warning',
  },
  {
    id: 'business',
    label: 'Business',
    icon: 'i-lucide-building-2',
    color: 'primary',
  },
] as const satisfies readonly {
  id: AppUserSubscription
  label: string
  icon: string
  color: 'neutral' | 'warning' | 'primary'
}[]

export function useAppUserSubscriptions(
  current?: MaybeRefOrGetter<AppUserSubscription | null | undefined>
) {
  const getSubscription = (id: AppUserSubscription) =>
    subscriptions.find((subscription) => subscription.id === id)
  const subscription = computed(
    () => getSubscription(toValue(current) || 'free') || subscriptions[0]
  )
  const next = computed(() => {
    const index = subscriptions.findIndex(
      (candidate) => candidate.id === subscription.value.id
    )
    return subscriptions[(index + 1) % subscriptions.length]!
  })
  const update = async (value: AppUserSubscription) => {
    await runAppUserCommand({
      action: 'set-self-subscription',
      subscription: value,
    })
  }

  return { getSubscription, next, subscription, subscriptions, update }
}
