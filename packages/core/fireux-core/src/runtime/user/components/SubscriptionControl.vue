<template>
  <UButton
    :label="presentation.label"
    :icon="presentation.icon"
    :color="presentation.color"
    variant="soft"
    size="xs"
    type="button"
    :disabled="pending"
    :loading="pending"
    class="rounded-full"
    :aria-label="
      canToggle
        ? `Switch ${presentation.label} subscription view`
        : `View pricing for ${presentation.label}`
    "
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed, navigateTo, ref, useToast } from '#imports'
import type { AppUserSubscription } from '../../app/models/app-user.model'
import { mutateAppMembership } from '../composables/firestore/utils/appMembershipMutation'
import { useDeveloperAccess } from '../composables/useDeveloperAccess'
import { useUser } from '../composables/useUser'

const { appAccess, appAccessOutcome } = useUser()
const { isDeveloper: isConfiguredDeveloper } = useDeveloperAccess()
const saving = ref(false)
const pending = computed(
  () => saving.value || appAccessOutcome.value !== 'ready'
)
const toast = useToast()
const subscriptions: AppUserSubscription[] = ['free', 'premium', 'business']
const presentations = {
  free: {
    label: 'Free',
    icon: 'i-lucide-user-round',
    color: 'neutral' as const,
  },
  premium: {
    label: 'Premium',
    icon: 'i-lucide-crown',
    color: 'warning' as const,
  },
  business: {
    label: 'Business',
    icon: 'i-lucide-building-2',
    color: 'primary' as const,
  },
}
const presentation = computed(
  () => presentations[appAccess.value.subscription]
)
const canToggle = computed(
  () =>
    isConfiguredDeveloper.value ||
    appAccess.value.role === 'dev' ||
    appAccess.value.role === 'admin'
)

async function handleClick() {
  if (pending.value) return
  if (!canToggle.value) {
    await navigateTo('/pricing')
    return
  }

  const currentIndex = subscriptions.indexOf(appAccess.value.subscription)
  const requested = subscriptions[(currentIndex + 1) % subscriptions.length]!

  saving.value = true
  try {
    await mutateAppMembership({
      action: 'set-self-subscription',
      subscription: requested,
    })
  } catch (error) {
    toast.add({
      title: 'Subscription unchanged',
      description:
        error instanceof Error
          ? error.message
          : 'Your subscription could not be changed.',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}
</script>
