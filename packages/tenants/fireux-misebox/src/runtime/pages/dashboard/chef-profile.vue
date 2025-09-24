<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="chefConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Chef Profile</h2>
            <OrganismsProfilesChefEdit :chef="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item="{ profile }"></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
// Page meta is provided by dashboard layout; explicit meta optional
definePageMeta({ layout: 'dashboard' })
</script>
