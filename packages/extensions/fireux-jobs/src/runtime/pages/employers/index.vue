<template>
  <UPage>
    <UPageBody>
      <UPageSection>
        <!-- Profiles via reusable Root (aligned with Chef pattern) -->
        <OrganismsProfileRoot
          :config="employerConfig"
          :onEnsure="createEmployer"
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
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { employerConfig } from '../../models/profiles/Employer.model'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/useEmployerCreate'

const { createEmployer } = useEmployerCreate()
</script>
