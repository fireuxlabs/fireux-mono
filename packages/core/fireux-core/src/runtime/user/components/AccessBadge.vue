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

const badges = {
  free: {
    label: 'Free',
    icon: 'i-lucide-user-round',
    color: 'neutral',
  },
  premium: {
    label: 'Premium',
    icon: 'i-lucide-crown',
    color: 'warning',
  },
} as const satisfies Record<
  UserSubscription,
  {
    label: string
    icon: string
    color: 'neutral' | 'warning'
  }
>

const badge = computed(() =>
  props.subscription ? badges[props.subscription] : null
)
</script>
