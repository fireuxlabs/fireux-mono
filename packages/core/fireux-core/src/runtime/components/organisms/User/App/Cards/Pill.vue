<template>
  <UCard>
    <div>
      <UAvatar size="sm" />
      <div>
        <h5>{{ appUser?.id || 'App User' }}</h5>
        <p v-if="appUser?.role">{{ appUser.role }}</p>
        <p v-if="appUser?.role">{{ appUser?.role }}</p>
      </div>
    </div>

  </UCard>
</template>

<script setup lang="ts">
import type { AppUser } from '../../../../../models/core/appUser.model'

defineProps<{
  appUser?: Pick<AppUser, 'id' | 'role'>
}>()
</script>
