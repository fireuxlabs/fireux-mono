<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Preview.vue -->
<template>
  <ClientOnly>
    <OrganismsUserCardsPreview v-if="currentUser" :card="card(currentUser)" :compact="false" />
  </ClientOnly>
</template>

<style scoped></style>

<script setup lang="ts">
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

const { currentUser, card } = useUser()
</script>
