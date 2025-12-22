<template>
  <OrganismsUserCardsPill v-if="normalized" :user="normalized" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { UserCard } from '../../../../models/core/user.model'
import OrganismsUserCardsPill from './Pill.vue'

const props = defineProps<{
  user?: UserCard.Cell | null
  to?: RouteLocationRaw | null
}>()

const normalized = computed<UserCard.Pill | null>(() => {
  if (!props.user) return null
  return {
    avatar: props.user.avatar,
    initials: props.user.initials,
    title: props.user.title,
    subtitle: props.user.subtitle,
    badges: props.user.badges,
    to: props.to ?? props.user.to ?? null,
    special: props.user.special,
    specialTooltip: props.user.specialTooltip,
    memberships: props.user.memberships,
  }
})
</script>
