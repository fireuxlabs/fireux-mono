<template>
  <div class="page space-y-6">
    <!-- CTAs: Only core CTA is relevant here -->
    <OrganismsUserCoreCTA v-if="!coreUser" />

    <!-- Current Core User -->
    <UCard v-if="coreUser">
      <h3 class="mb-3">Your Core User</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <OrganismsUserCoreCardsPill :core-user="coreUser" />
        <OrganismsUserCoreCardsProfile :core-user="coreUser" />
      </div>
    </UCard>

    <!-- All Core Users -->
    <UCard>
      <div class="flex items-center justify-between mb-3">
        <h3>All Core Users ({{ coreUsers?.length || 0 }})</h3>
      </div>

      <div
        v-if="coreUsers?.length"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <OrganismsUserCoreCardsCell
          v-for="(user, idx) in coreUsers"
          :key="user.id || user.email || idx"
          :core-user="user"
          class="cursor-default"
        />
      </div>
      <p v-else class="opacity-70">No core users found.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useCoreUser } from '../../composables/firestore/CoreUser/useCoreUser'

const { coreUser, coreUsers } = useCoreUser()
</script>

<style scoped>
.page {
  /* container */
}
</style>
