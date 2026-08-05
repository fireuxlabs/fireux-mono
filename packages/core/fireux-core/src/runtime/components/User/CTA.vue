<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: reserve the page CTA for onboarding and keep current-user content compact. -->
<template>
  <div
    v-if="currentUser"
    data-entity-cta-family="profile-managed"
    class="space-y-2"
  >
    <UserCtaCurrent :current-user="currentUser" />
    <UserCtaProfileChoices :current-profiles="appUser?.profiles || []" />
  </div>

  <UPageCTA
    v-else
    data-entity-cta-family="profile-managed"
    title="Current User"
    description="Sign in to view or create your profile."
    variant="naked"
  >
    <template #default>
      <UserCreateSystem />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { currentUser, appUser } = useUser()
</script>
