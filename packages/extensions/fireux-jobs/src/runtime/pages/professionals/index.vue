<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Professionals"
      description="Inspect your professional profile and browse all professionals available to this runtime."
    />

    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesProfessionalSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
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

const { coreProfile, appProfile, pill } = useProfessional()
const { isTenant } = useFireUXConfig()
const hasProfile = computed(() => Boolean(coreProfile.value))

useHead({ title: 'Professionals' })
</script>
