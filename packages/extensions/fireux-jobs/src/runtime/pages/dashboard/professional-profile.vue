<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="professionalConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Professional Profile</h2>
            <JobProfilesProfessionalEdit :professional="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item="{ profile }"></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional.model'
definePageMeta({ layout: 'dashboard' })
</script>
