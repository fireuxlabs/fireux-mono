<!-- Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: present the derived Free, Premium, Admin, or Dev tier consistently. -->
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
import type { UserAccessTier } from '../../composables/fireux/firestore/core/user/utils/view/useUserPermissions'

const props = withDefaults(
  defineProps<{
    tier?: UserAccessTier | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    tier: null,
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
  admin: {
    label: 'Admin',
    icon: 'i-lucide-shield-check',
    color: 'primary',
  },
  dev: {
    label: 'Dev',
    icon: 'i-lucide-code-xml',
    color: 'info',
  },
} as const satisfies Record<
  UserAccessTier,
  {
    label: string
    icon: string
    color: 'neutral' | 'warning' | 'primary' | 'info'
  }
>

const badge = computed(() => (props.tier ? badges[props.tier] : null))
</script>
