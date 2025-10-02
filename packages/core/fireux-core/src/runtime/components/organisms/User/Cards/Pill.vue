<template>
  <div>
    <UAvatar :src="user?.avatar" :alt="user?.display_name" size="sm" />
    <strong>{{ user?.display_name }}</strong>
    <small v-if="user?.handle"> · @{{ user?.handle }}</small>
    <UBadge v-if="isAdmin" size="xs" variant="subtle">admin</UBadge>
  </div>
</template>

<script setup lang="ts">
import { useUser } from '../../../../composables/firestore/user/useUser'
const { user, isAdmin } = useUser()
</script>
