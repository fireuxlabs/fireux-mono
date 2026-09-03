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
import { useCurrentAppContext } from '../../app/composables/useCurrentAppContext'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useSubscriptions } from '../composables/useSubscriptions'

const props = withDefaults(defineProps<{ alwaysVisible?: boolean }>(), {
  alwaysVisible: false,
})

const { currentUser, hasAuthState } = useAuth()
const { membership } = useCurrentAppContext()
const mounted = ref(false)
const guest = computed(
  () => hasAuthState.value && currentUser.value?.isAnonymous === true
)
const showSubscription = computed(
  () =>
    mounted.value &&
    (props.alwaysVisible || Boolean(membership.value) || guest.value)
)
const hasSubscription = computed(() => Boolean(membership.value) || guest.value)
const subscriptionId = computed(
  () => membership.value?.subscription || (guest.value ? 'free' : undefined)
)
const { subscription, next, update } = useSubscriptions(subscriptionId)
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
