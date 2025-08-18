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

    <div v-if="appUser?.isAdmin">
      <UBadge color="red">Admin</UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppUser } from '../../../../../models/app/appUser.model'

defineProps<{
  appUser?: Partial<AppUser>
}>()
</script>
