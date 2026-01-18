<template>
  <UPage>
    <UPageHeader
      title="Dev · Jobs"
      description="Model shapes for Jobs, Professionals, and Agents."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Jobs · Model'"
          :model="jobModelRuntime"
        />
      </UCard>

      <UCard>
        <DevModel
          :title="'Professionals · Model'"
          :model="professionalModelRuntime"
        />
      </UCard>

      <UCard>
        <DevModel
          :title="'Agents · Model'"
          :model="agentModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { Job as JobModelRuntime } from '../../models/objects/job.model'
import { AgentCore as AgentCoreRuntime } from '../../models/profiles/Agent/Agent.model'
import { ProfessionalCore as ProfessionalCoreRuntime } from '../../models/profiles/Professional/Professional.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const jobModelRuntime = JobModelRuntime as unknown as Record<string, unknown>
const professionalModelRuntime = ProfessionalCoreRuntime as unknown as Record<string, unknown>
const agentModelRuntime = AgentCoreRuntime as unknown as Record<string, unknown>
</script>
