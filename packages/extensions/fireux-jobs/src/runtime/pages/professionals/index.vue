<template>
  <UPage>
    <UPageBody>
      <UPageSection>
        <OrganismsProfileRoot
          :config="professionalConfig"
          :onEnsure="onEnsureProfessional"
        >
          <!-- Current profile (optional) -->
          <template #current-assets="{ profile }">
            <template v-if="profile">
              <OrganismsProfilesProfessionalCardsPill
                :professional="profile"
                class="mb-3"
              />
              <OrganismsProfilesProfessionalCardsCell :professional="profile" />
            </template>
          </template>

          <!-- List items -->
          <template #item="{ profile }">
            <OrganismsProfilesProfessionalCardsCell :professional="profile" />
          </template>
        </OrganismsProfileRoot>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate'

const { createProfessional } = useProfessionalCreate()
async function onEnsureProfessional() {
  await createProfessional()
}
</script>
