<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Jobs (Ext)"
      description="Model and collection tools for jobs, professionals, and agents."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Jobs</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('jobs')"
            >
              {{ openSections.jobs ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.jobs" class="mt-4">
            <JobModelInspection />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Professionals</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('professionals')"
            >
              {{ openSections.professionals ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.professionals" class="mt-4">
            <ProfessionalModelInspection />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Agents</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('agents')"
            >
              {{ openSections.agents ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.agents" class="mt-4">
            <AgentModelInspection />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const openSections = reactive({
  jobs: false,
  professionals: false,
  agents: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})
</script>
