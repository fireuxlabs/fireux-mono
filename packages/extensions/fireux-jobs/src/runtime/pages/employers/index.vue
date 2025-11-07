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
            <div class="space-y-3">
              <OrganismsProfilesEmployerCardsPill
                :employer="pillProps(profile)"
              />
              <OrganismsProfilesEmployerCardsCell
                :employer="cellProps(profile)"
              />
            </div>
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <div class="space-y-3">
            <OrganismsProfilesEmployerCardsPill
              :employer="pillProps(profile)"
            />
            <OrganismsProfilesEmployerCardsCell
              :employer="cellProps(profile)"
            />
          </div>
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { employerConfig } from '../../models/profiles/Employer.model'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate.ts'

const { pillProps, cellProps } = useEmployer()
const { createEmployer } = useEmployerCreate()
async function onEnsureEmployer() {
  await createEmployer()
}
</script>
