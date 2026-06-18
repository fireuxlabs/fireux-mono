<template>
  <UPageCTA
    data-entity-cta-family="profile-managed"
    :class="['cta', { 'cta--usage': isResolved && isInitialized && currentUser }]"
    :title="isResolved && isInitialized && currentUser ? undefined : 'Current User'"
    :description="isResolved && isInitialized && currentUser ? undefined : 'Sign in to view or create your profile.'"
    variant="naked"
  >
    <template #default>
      <div v-if="currentUser" class="space-y-2">
        <UserCtaCurrent :current-user="currentUser" />
        <UserCtaProfileChoices :current-profiles="currentUser.profiles" />
      </div>

      <UserCreateSystem v-else />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { isResolved, isInitialized, currentUser } = useUser()
</script>
