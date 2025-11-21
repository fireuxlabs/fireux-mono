<!-- FILE: packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfileSectionsSingle :title="currentProfileTitle">
          <OrganismsProfilesChefCardsCell v-if="cell" :chef="cell" />
          <OrganismsProfilesChefCardsPill v-if="pill" :chef="pill" />
        </OrganismsProfileSectionsSingle>
      </template>

      <OrganismsProfilesChefCTA v-else />

      <OrganismsProfilesChefSectionsGlobalCollection />
      <OrganismsProfilesChefSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

definePageMeta({
  nav: {
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-egg-fried',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Chefs',
  description: 'Chef profiles resolved for this runtime.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const { pill, cell } = useChef()
const { isTenant } = useFireUXConfig()
const { hasProfile: userHasProfile } = useUser()
const hasProfile = computed(() => userHasProfile('chef'))

const pageTitle = 'Chefs'
const pageDescription =
  'Inspect your chef profile and browse all chefs resolved for this runtime.'
const currentProfileTitle = 'Your chef profile'

useHead({ title: pageTitle })
</script>
