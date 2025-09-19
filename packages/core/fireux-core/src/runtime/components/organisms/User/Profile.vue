<template>
  <div class="unified-profile grid gap-4 md:grid-cols-2">
    <OrganismsUserCardsPill :user="user" />
    <OrganismsUserCardsProfile :user="user" />
  </div>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../models/core/user.model'

const props = defineProps<{ user: UserCard.Profile }>()
</script>
