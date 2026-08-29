<template>
  <UButton
    :label="presentation.label"
    :icon="presentation.icon"
    :color="presentation.color"
    variant="soft"
    size="xs"
    :to="canToggle ? undefined : '/pricing'"
    :disabled="saving"
    :loading="saving"
    class="rounded-full"
    :aria-label="
      canToggle
        ? `Switch ${presentation.label} subscription view`
        : `View pricing for ${presentation.label}`
    "
    @click="canToggle && toggle()"
  />
</template>

<script setup lang="ts">
import { computed, ref, useToast } from '#imports'
import type { AppUserSubscription } from '../../app/models/app-user.model'
import { mutateAppMembership } from '../composables/firestore/utils/appMembershipMutation'
import { useUser } from '../composables/useUser'

const { appAccess } = useUser()
const saving = ref(false)
const toast = useToast()
const canToggle = import.meta.dev
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
async function toggle() {
  if (saving.value) return
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
