<template>
  <div class="page space-y-6">
    <!-- CTAs -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <template v-else>
      <OrganismsUserAppCTA v-if="role === 'tenant' && !appUser" />
    </template>

    <!-- Current App User -->
    <UCard v-if="appUser">
      <h3 class="mb-3">Your App User</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <OrganismsUserAppCardsPill :appUser="appUser" />
        <OrganismsUserAppCardsProfile :user="appUser" />
      </div>
    </UCard>

    <!-- All App Users -->
    <UCard>
      <div class="flex items-center justify-between mb-3">
        <h3>All App Users ({{ appUsers?.length || 0 }})</h3>
      </div>

      <div
        v-if="appUsers?.length"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <OrganismsUserAppCardsCell
          v-for="user in appUsers"
          :key="user.id"
          :user="user"
          class="cursor-default"
        />
      </div>
      <p v-else class="opacity-70">No app users found.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useApp } from '../../composables/app/useApp'
import { useAppUser } from '../../composables/firestore/AppUser/useAppUser'
import { useCoreUser } from '../../composables/firestore/CoreUser/useCoreUser'

const { role } = useApp()
const { appUser, appUsers } = useAppUser()
const { coreUser } = useCoreUser()
</script>

<style scoped>
.page {
  /* container */
}
</style>
