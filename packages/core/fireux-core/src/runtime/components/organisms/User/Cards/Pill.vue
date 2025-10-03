<template>
  <div class="inline-flex items-center gap-2">
    <UAvatar :src="user?.avatar || ''" :alt="user?.display_name || 'User'" size="sm" />
    <strong>{{ user?.display_name }}</strong>
    <small v-if="user?.handle"> · @{{ user?.handle }}</small>
    <UBadge v-if="user?.role === 'admin'" size="xs" variant="subtle">admin</UBadge>
  </div>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../models/core/user.model'
defineProps<{ user?: UserCard.Pill }>()
</script>
