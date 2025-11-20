<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Agents"
      description="Inspect your agent profile and browse all agents resolved for this runtime."
    />
    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesAgentSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
      </template>

      <UPageCTA
        v-else
        title="Create your agent profile"
        description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
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
            {{ isCreating ? 'Creating...' : 'Create agent profile' }}
          </UButton>
        </template>
      </UPageCTA>

      <p v-if="createError" class="cta-error">{{ createError }}</p>

      <OrganismsProfilesAgentSectionsGlobalCollection />
      <OrganismsProfilesAgentSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAgent } from '../../composables/firestore/profiles/Agent/useAgent.ts'
import { useAgentCreate } from '../../composables/firestore/profiles/Agent/main/useAgentCreate.ts'
import OrganismsProfilesAgentSectionsSingle from '../../components/Organisms/profiles/Agent/Sections/Single.vue'
import OrganismsProfilesAgentSectionsGlobalCollection from '../../components/Organisms/profiles/Agent/Sections/GlobalCollection.vue'
import OrganismsProfilesAgentSectionsLocalCollection from '../../components/Organisms/profiles/Agent/Sections/LocalCollection.vue'

definePageMeta({
  nav: {
    key: 'agents',
    label: 'Agents',
    icon: 'i-lucide-building-2',
    order: 65,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Agents',
  description: 'Agent profiles resolved for this runtime.',
  layout: 'default',
  name: 'AgentsIndexPage',
})

const { coreProfile, appProfile, pill } = useAgent()
const { createAgent } = useAgentCreate()
const { isTenant } = useFireUXConfig()

const isCreating = ref(false)
const createError = ref<string | null>(null)

const handleCreate = async () => {
  if (isCreating.value) return

  isCreating.value = true
  createError.value = null

  try {
    await createAgent()
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create agent profile. Please try again.'
    createError.value = message
  } finally {
    if (createError.value) {
      isCreating.value = false
    }
  }
}
const hasProfile = computed(() => Boolean(coreProfile.value))

useHead({ title: 'Agents' })
</script>

<style scoped>
.cta-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>
