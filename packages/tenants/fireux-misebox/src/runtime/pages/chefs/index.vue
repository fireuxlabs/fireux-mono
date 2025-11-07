<!-- packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageBody class="page-index">
      <UPageHeader title="Chefs" />

      <!-- Current Chef -->
      <UCard class="index-card">
        <template v-if="current">
          <MoleculesPill v-bind="pillProps(current)" />
          <OrganismsProfilesChefCardsCell :chef="cellProps(current)" />
        </template>

        <template v-else>
          <UPageCTA title="Create your Chef profile to appear in listings.">
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Chef Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Chef Collection -->
      <UCard class="index-card">
        <template v-if="items.length">
          <div class="entity-grid">
            <OrganismsProfilesChefCardsCell
              v-for="(p, index) in items"
              :key="p.id || 'chef-' + index"
              :chef="cellProps(p)"
            />
          </div>
        </template>

        <MoleculesNotFound v-else kind="collection" entity="chefs" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import 'fireux-core/runtime/assets/styles/scss/pages/indexes.scss'
import { computed } from 'vue'
import OrganismsProfilesChefCardsCell from '../../components/organisms/profiles/Chef/Cards/Cell.vue'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'

const chef = useChef()
const { pillProps, cellProps, createChef, collection, activeProfile } = chef

const current = activeProfile

const items = computed(() => collection.chefs?.value ?? [])

const creating = createChef.state

const onCreate = async () => {
  await createChef()
}
</script>
