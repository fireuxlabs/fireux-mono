<!-- packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UContainer class="py-8">
      <OrganismsProfileRoot :config="chefConfig" :onEnsure="onEnsureChef">
        <!-- Current profile (optional) -->
        <template #current-assets="{ profile }">
          <template v-if="profile">
            <OrganismsProfilesChefCardsPill :chef="profile" class="mb-3" />
            <OrganismsProfilesChefCardsCell :chef="profile" />
          </template>
        </template>

        <!-- List items -->
        <template #item="{ profile }">
          <OrganismsProfilesChefCardsCell :chef="profile" />
        </template>
      </OrganismsProfileRoot>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
import { useChefCreate } from '../../composables/firestore/profiles/Chef/useChefCreate'

const { createChef } = useChefCreate()

async function onEnsureChef() {
  // minimal: delegate creation; no UI side-effects here
  await createChef()
}
</script>
