<!-- packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot :config="chefConfig" :onEnsure="onEnsureChef">
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <div class="space-y-3">
              <OrganismsProfilesChefCardsPill :chef="pillProps(profile)" />
              <OrganismsProfilesChefCardsCell :chef="cellProps(profile)" />
            </div>
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <div class="space-y-3">
            <OrganismsProfilesChefCardsPill :chef="pillProps(profile)" />
            <OrganismsProfilesChefCardsCell :chef="cellProps(profile)" />
          </div>
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'
import { useChefCreate } from '../../composables/firestore/profiles/Chef/main/useChefCreate.ts'

const { pillProps, cellProps } = useChef()
const { createChef } = useChefCreate()

async function onEnsureChef() {
  // minimal: delegate creation; no UI side-effects here
  await createChef()
}
</script>
