<template>
  <section data-entity-current-family="user">
    <UserCurrentSummary :current-user="currentUser" />
  </section>
</template>

<script setup lang="ts">
import type { User } from '../../models/user.model.ts'

defineProps<{ currentUser: User }>()
</script>
