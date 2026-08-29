<template>
  <UBadge
    v-if="badge"
    :label="badge.label"
    :icon="badge.icon"
    :color="badge.color"
    variant="soft"
    :size="size"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserSubscription } from '../composables/useUserPermissions'
import { useSubscriptions } from '../composables/useSubscriptions'

const props = withDefaults(
  defineProps<{
    subscription?: UserSubscription | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    subscription: null,
    size: 'sm',
  }
)
const { getSubscription } = useSubscriptions()

const badge = computed(() =>
  props.subscription ? getSubscription(props.subscription) : null
)
</script>
