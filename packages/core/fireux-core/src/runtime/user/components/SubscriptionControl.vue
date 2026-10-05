<template>
  <UButton
    v-if="showSubscription"
    :label="hasSubscription ? subscription.label : 'Subscription'"
    :icon="hasSubscription ? subscription.icon : 'i-lucide-badge'"
    :color="hasSubscription ? subscription.color : 'neutral'"
    variant="soft"
    size="xs"
    :to="hasSubscription && !canToggle ? '/pricing' : undefined"
    :disabled="saving || !hasSubscription"
    :loading="saving"
    class="rounded-full"
    :aria-label="
      !hasSubscription
        ? 'Subscription unavailable'
        : canToggle
          ? `Switch ${subscription.label} subscription view`
          : `View pricing for ${subscription.label}`
    "
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useToast } from '#imports'
import { useAppSession } from '../../app/composables/useAppSession'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useWorkspaceEntryState } from '../../composables/fireux/workspace/useWorkspaceEntryState'
import { useAppUserSubscriptions } from '../../app/composables/membership/useAppUserSubscriptions'

const props = withDefaults(defineProps<{ alwaysVisible?: boolean }>(), {
  alwaysVisible: false,
})

const { currentUser } = useAuth()
const { isGuest: guest } = useWorkspaceEntryState()
const { appUser } = useAppSession()
const mounted = ref(false)
const showSubscription = computed(
  () =>
    mounted.value &&
    hasSubscription.value &&
    (props.alwaysVisible || Boolean(appUser.value) || guest.value)
)
const hasSubscription = computed(() => Boolean(appUser.value) || guest.value)
const subscriptionId = computed(
  () => appUser.value?.subscription || (guest.value ? 'free' : undefined)
)
const { subscription, next, update } = useAppUserSubscriptions(subscriptionId)
const saving = ref(false)
const toast = useToast()
const canToggle = computed(
  () => import.meta.dev && currentUser.value?.isAnonymous === false
)

onMounted(() => {
  mounted.value = true
})

async function toggle() {
  if (!hasSubscription.value || !canToggle.value || saving.value) return

  saving.value = true
  try {
    await update(next.value.id)
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
