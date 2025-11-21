<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfileSectionsSingle :title="currentProfileTitle">
          <OrganismsProfilesProfessionalCardsCell
            v-if="cell"
            :professional="cell"
          />
          <OrganismsProfilesProfessionalCardsPill
            v-if="pill"
            :professional="pill"
          />
        </OrganismsProfileSectionsSingle>
      </template>

      <OrganismsProfilesProfessionalCTA v-else />

      <OrganismsProfilesProfessionalSectionsGlobalCollection />
      <OrganismsProfilesProfessionalSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description: 'Professional profiles resolved for this runtime.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

const { pill, cell } = useProfessional()
const { isTenant } = useFireUXConfig()
const { hasProfile: userHasProfile } = useUser()
const hasProfile = computed(() => userHasProfile('professional'))

const pageTitle = 'Professionals'
const pageDescription =
  'Inspect your professional profile and browse all professionals available to this runtime.'
const currentProfileTitle = 'Your professional profile'

useHead({ title: pageTitle })
</script>
