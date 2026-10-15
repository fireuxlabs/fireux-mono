<template>
  <section data-entity-current-family="user" class="space-y-2">
    <UserCurrentSummary :current-user="currentUser" />
  </section>
</template>

<script setup lang="ts">
import type { User } from '../../models/user.model.ts'

defineProps<{ currentUser: User }>()
</script>
