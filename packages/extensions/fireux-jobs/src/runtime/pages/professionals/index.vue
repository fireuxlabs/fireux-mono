<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot
        :config="professionalConfig"
        :onEnsure="onEnsureProfessional"
      >
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <div class="space-y-3">
              <OrganismsProfilesProfessionalCardsPill
                :professional="pillProps(profile)"
              />
              <OrganismsProfilesProfessionalCardsCell
                :professional="cellProps(profile)"
              />
            </div>
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <div class="space-y-3">
            <OrganismsProfilesProfessionalCardsPill
              :professional="pillProps(profile)"
            />
            <OrganismsProfilesProfessionalCardsCell
              :professional="cellProps(profile)"
            />
          </div>
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate.ts'

const { pillProps, cellProps } = useProfessional()
const { createProfessional } = useProfessionalCreate()
async function onEnsureProfessional() {
  await createProfessional()
}
</script>
