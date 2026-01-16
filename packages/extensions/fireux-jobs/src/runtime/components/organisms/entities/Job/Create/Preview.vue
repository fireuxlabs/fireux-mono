<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create/Preview.vue -->
<!-- NOTE for Copilot:
     - This is the PREVIEW surface for job creation.
     - It renders the SAME shape as useJobCreate().form: { title, description }.
     - This card will later mirror the pipeline/job list UI.
-->

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400">Preview</p>
          <h3 class="text-base font-semibold text-gray-900">
            {{ title }}
          </h3>

          <div v-if="agentCard" class="mt-3 space-y-1">
            <p class="text-xs uppercase tracking-wide text-gray-400">
              Posted by
            </p>
            <component
              :is="wrapperFor(agentCard)"
              v-bind="wrapperPropsFor(agentCard)"
              class="block"
            >
              <OrganismsProfilesAgentCardsPill v-bind="agentCard" :show-subtitle="false" />
            </component>
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-3 text-sm text-gray-600">
      <p>This is how the job will look in a simple pipeline card.</p>

      <div class="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
        <p class="text-xs uppercase tracking-wide text-gray-400">
          Description
        </p>
        <p class="whitespace-pre-line text-sm text-gray-700">
          {{ description || 'No description yet.' }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

type JobCreateForm = {
  title: string
  description: string
}

const props = defineProps<{
  form: JobCreateForm
}>()

const { coreProfile, card } = useAgent()
const agentCard = computed(() => (coreProfile.value ? card(coreProfile.value) : null))

const title = computed(() => props.form.title.trim() || 'Untitled job')
const description = computed(() => props.form.description.trim())

const wrapperFor = (card: ReturnType<typeof card> | null) => (card?.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: ReturnType<typeof card> | null) => (card?.to ? { to: card.to } : {})
</script>
