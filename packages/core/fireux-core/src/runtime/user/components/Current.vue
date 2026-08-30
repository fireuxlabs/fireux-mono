<template>
  <section data-entity-current-family="user" class="space-y-2">
    <UserCurrentSummary :current-user="currentUser" />
    <UserCurrentProfileChoices :current-profiles="currentProfiles" />
  </section>
</template>

<script setup lang="ts">
import type { User } from '../models/user.model.ts'

withDefaults(
  defineProps<{
    currentUser: User
    currentProfiles?: string[]
  }>(),
  { currentProfiles: () => [] }
)
</script>
