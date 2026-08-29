<template>
  <UButton
    :label="visibleSubscription.label"
    :icon="visibleSubscription.icon"
    :color="visibleSubscription.color"
    variant="soft"
    size="xs"
    :to="canToggle ? undefined : '/pricing'"
    :disabled="saving"
    :loading="saving"
    class="rounded-full"
    :aria-label="
      canToggle
        ? `Switch ${visibleSubscription.label} subscription view`
        : `View pricing for ${visibleSubscription.label}`
    "
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useToast } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useSubscriptions } from '../composables/useSubscriptions'
import { useUser } from '../composables/useUser'

const { currentUser } = useAuth()
const { subscription: subscriptionId } = useUser()
const { subscription, subscriptions, next, update } =
  useSubscriptions(subscriptionId)
const mounted = ref(false)
const saving = ref(false)
const toast = useToast()
const visibleSubscription = computed(() =>
  mounted.value ? subscription.value : subscriptions[0]!
)
const canToggle = computed(
  () =>
    mounted.value && import.meta.dev && currentUser.value?.isAnonymous === false
)

onMounted(() => {
  mounted.value = true
})

async function toggle() {
  if (!canToggle.value || saving.value) return

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
