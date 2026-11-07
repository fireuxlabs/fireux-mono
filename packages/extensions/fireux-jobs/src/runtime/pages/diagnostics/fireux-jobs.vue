<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Jobs (Ext)"
      description="Model and collection tools for jobs, professionals, and agents."
    />

    <UPageBody class="pagebody">
      <div>
        <UCard>
          <div class="card__header">
            <div>Jobs</div>
            <UButton variant="ghost" size="xs" @click="toggleSection('jobs')">
              {{ openSections.jobs ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.jobs">
            <JobModelInspection />
          </div>
        </UCard>

        <UCard>
          <div class="card__header">
            <div>Professionals</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('professionals')"
            >
              {{ openSections.professionals ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.professionals">
            <ProfessionalModelInspection />
          </div>
        </UCard>

        <UCard>
          <div class="card__header">
            <div>Agents</div>
            <UButton variant="ghost" size="xs" @click="toggleSection('agents')">
              {{ openSections.agents ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.agents">
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
