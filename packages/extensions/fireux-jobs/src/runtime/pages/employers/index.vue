<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="employerConfig"
        :onEnsure="onEnsureEmployer"
      >
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesEmployerCardsPill
              :employer="profile"
              class="mb-3"
            />
            <OrganismsProfilesEmployerCardsCell :employer="profile" />
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <OrganismsProfilesEmployerCardsCell :employer="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { employerConfig } from '../../models/profiles/Employer.model'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/useEmployerCreate'

const { createEmployer } = useEmployerCreate()
async function onEnsureEmployer() {
  await createEmployer()
}
</script>
