<!-- packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue -->
<template>
  <UPage>
    <UPageBody class="page-index">
      <UPageHeader title="Employers" />

      <!-- Current Employer -->
      <UCard class="index-card">
        <template v-if="current">
          <MoleculesPill v-bind="pillProps(current)" />
          <OrganismsProfilesEmployerCardsCell :employer="cellProps(current)" />
        </template>

        <template v-else>
          <UPageCTA title="Create your Employer profile to appear in listings.">
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Employer Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Employer Collection -->
      <UCard class="index-card">
        <template v-if="items.length">
          <div class="entity-grid">
            <OrganismsProfilesEmployerCardsCell
              v-for="(p, index) in items"
              :key="p.id || 'employer-' + index"
              :employer="cellProps(p)"
            />
          </div>
        </template>

        <MoleculesNotFound v-else kind="collection" entity="employers" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import 'fireux-core/runtime/assets/styles/scss/pages/indexes.scss'
import { computed } from 'vue'
import OrganismsProfilesEmployerCardsCell from '../../components/Organisms/profiles/Employer/Cards/Cell.vue'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useEmployerComputed } from '../../composables/firestore/profiles/Employer/main/useEmployerComputed.ts'
import { useEmployerInterface } from '../../composables/firestore/profiles/Employer/main/useEmployerInterface.ts'
import { useEmployerCollection } from '../../composables/firestore/profiles/Employer/main/useEmployerCollection.ts'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate.ts'

const { profile } = useEmployer()
const { activeProfile } = useEmployerComputed(profile)
const { pillProps, cellProps } = useEmployerInterface(profile)
const { employers } = useEmployerCollection()
const { createEmployer } = useEmployerCreate()

const current = activeProfile
const items = computed(() => employers.value ?? [])

const creating = createEmployer.state

const onCreate = async () => {
  await createEmployer()
}
</script>
