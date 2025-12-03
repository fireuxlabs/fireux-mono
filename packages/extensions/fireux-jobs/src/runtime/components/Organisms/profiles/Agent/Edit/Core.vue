<template>
  <ClientOnly>
    <div v-if="agent" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Tagline"
            :firebase-value="tagline"
            placeholder="Ex: Agency supporting hospitality talent"
            :update-function="handleTagline"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Short Bio"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="agent.bio_short || ''"
            placeholder="Summarize your organization in a few sentences"
            :update-function="handleBioShort"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="agent profile" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentCoreProfile } from '../../../../../models/profiles/Agent.model.ts'
import { useAgentUpdate } from '../../../../../composables/firestore/profiles/Agent/main/useAgentUpdate.ts'

const props = defineProps<{ agent: AgentCoreProfile | null }>()

const agent = computed(() => props.agent ?? null)
const { updateTagline, updateBioShort } = useAgentUpdate()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const tagline = computed(
  () =>
    agent.value?.tagline ??
    (agent.value as { subtitle?: string | null } | null)?.subtitle ??
    ''
)

const handleTagline = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateTagline(value)
    toast?.add({
      title: 'Tagline updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update tagline',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleBioShort = async (value: string) => {
  if (!agent.value) return 'success'
  try {
    await updateBioShort(value)
    toast?.add({
      title: 'Short bio updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast?.add({
      title: 'Failed to update short bio',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}
</script>
