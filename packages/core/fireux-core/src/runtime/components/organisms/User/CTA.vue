<template>
  <UCard v-if="!user">
    <p>Please sign in</p>
  </UCard>

  <UCard v-else-if="!hasCoreUserProfile">
    <p>Create your global profile</p>
  </UCard>

  <UCard v-else-if="hasAppUserProfile === false">
    <p>Complete your app profile</p>
  </UCard>
</template>

<script setup lang="ts">
import { useUser } from '../../../composables/firestore/user/useUser'

const { user, hasCoreUserProfile, hasAppUserProfile } = useUser()
</script>
