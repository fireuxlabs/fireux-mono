<template>
  <UCard>
    <div>
      <UAvatar
        :src="appUser?.avatar"
        :alt="appUser?.display_name || 'App User'"
        size="sm"
      />
      <div>
        <h5>{{ appUser?.display_name || appUser?.email || 'App User' }}</h5>
        <p v-if="appUser?.role">{{ appUser.role }}</p>
      </div>
    </div>

    <div v-if="appUser?.role === 'admin'">
      <UBadge color="error">Admin</UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppUser } from '../../../../../models'

defineProps<{
  appUser?: Partial<AppUser>
}>()
</script>
