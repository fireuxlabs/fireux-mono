<!-- packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageBody class="page-index">
      <UPageHeader title="Professionals" />

      <!-- Current Professional -->
      <UCard class="index-card">
        <template v-if="current">
          <MoleculesPill v-bind="pillProps(current)" />
          <OrganismsProfilesProfessionalCardsCell
            :professional="cellProps(current)"
          />
        </template>

        <template v-else>
          <UPageCTA
            title="Create your Professional profile to appear in listings."
          >
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Professional Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Professional Collection -->
      <UCard class="index-card">
        <template v-if="items.length">
          <div class="entity-grid">
            <OrganismsProfilesProfessionalCardsCell
              v-for="(p, index) in items"
              :key="p.id || 'professional-' + index"
              :professional="cellProps(p)"
            />
          </div>
        </template>

        <MoleculesNotFound v-else kind="collection" entity="professionals" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import 'fireux-core/runtime/assets/styles/scss/pages/indexes.scss'
import { computed } from 'vue'
import OrganismsProfilesProfessionalCardsCell from '../../components/Organisms/profiles/Professional/Cards/Cell.vue'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useProfessionalComputed } from '../../composables/firestore/profiles/Professional/main/useProfessionalComputed.ts'
import { useProfessionalInterface } from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useProfessionalCollection } from '../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate.ts'

const { profile } = useProfessional()
const { activeProfile } = useProfessionalComputed(profile)
const { pillProps, cellProps } = useProfessionalInterface(profile)
const { professionals } = useProfessionalCollection()
const { createProfessional } = useProfessionalCreate()

const current = activeProfile
const items = computed(() => professionals.value ?? [])

const creating = createProfessional.state

const onCreate = async () => {
  await createProfessional()
}
</script>
