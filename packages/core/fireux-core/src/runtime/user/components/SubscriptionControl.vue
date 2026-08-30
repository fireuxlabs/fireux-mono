<template>
  <UButton
    v-if="membership"
    :label="subscription.label"
    :icon="subscription.icon"
    :color="subscription.color"
    variant="soft"
    size="xs"
    :to="canToggle ? undefined : '/pricing'"
    :disabled="saving"
    :loading="saving"
    class="rounded-full"
    :aria-label="
      canToggle
        ? `Switch ${subscription.label} subscription view`
        : `View pricing for ${subscription.label}`
    "
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { computed, ref, useToast } from '#imports'
import { useCurrentAppContext } from '../../app/composables/useCurrentAppContext'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useSubscriptions } from '../composables/useSubscriptions'

const { currentUser } = useAuth()
const { membership } = useCurrentAppContext()
const subscriptionId = computed(() => membership.value?.subscription)
const { subscription, next, update } = useSubscriptions(subscriptionId)
const saving = ref(false)
const toast = useToast()
const canToggle = computed(
  () => import.meta.dev && currentUser.value?.isAnonymous === false
)

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
