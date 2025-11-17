<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Employers"
      description="Inspect your employer profile and browse all employers resolved for this runtime."
    />
    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesEmployerSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
      </template>

      <UPageCTA
        v-else
        title="Create your employer profile"
        description="Add an employer profile to your FireUX portfolio so talent knows who is hiring."
        variant="naked"
      >
        <template #links>
          <UButton
            color="primary"
            size="lg"
            :loading="isCreating"
            :disabled="isCreating"
            @click="handleCreate"
          >
            {{ isCreating ? 'Creating...' : 'Create employer profile' }}
          </UButton>
        </template>
      </UPageCTA>

      <p v-if="createError" class="cta-error">{{ createError }}</p>

      <OrganismsProfilesEmployerSectionsGlobalCollection />
      <OrganismsProfilesEmployerSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate.ts'
import OrganismsProfilesEmployerSectionsSingle from '../../components/Organisms/profiles/Employer/Sections/Single.vue'
import OrganismsProfilesEmployerSectionsGlobalCollection from '../../components/Organisms/profiles/Employer/Sections/GlobalCollection.vue'
import OrganismsProfilesEmployerSectionsLocalCollection from '../../components/Organisms/profiles/Employer/Sections/LocalCollection.vue'

definePageMeta({
  nav: {
    key: 'employers',
    label: 'Employers',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Employers',
  description: 'Employer profiles resolved for this runtime.',
  layout: 'default',
  name: 'EmployersIndexPage',
})

const { coreProfile, appProfile, pill } = useEmployer()
const { createEmployer } = useEmployerCreate()
const { isTenant } = useFireUXConfig()

const isCreating = ref(false)
const createError = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    await createEmployer()
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create employer profile. Please try again.'
    createError.value = message
  } finally {
    if (createError.value) {
      isCreating.value = false
    }
  }
}
const hasProfile = computed(() => Boolean(coreProfile.value))

useHead({ title: 'Employers' })
</script>

<style scoped>
.cta-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>
