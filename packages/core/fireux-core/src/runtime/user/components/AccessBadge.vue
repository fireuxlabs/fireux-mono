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
import type { AppUserSubscription } from '../../app/models/app-user.model'
import { useAppUserSubscriptions } from '../../app/composables/membership/useAppUserSubscriptions'

const props = withDefaults(
  defineProps<{
    subscription?: AppUserSubscription | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    subscription: null,
    size: 'sm',
  }
)
const { getSubscription } = useAppUserSubscriptions()

const badge = computed(() =>
  props.subscription ? getSubscription(props.subscription) : null
)
</script>
