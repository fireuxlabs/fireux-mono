<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: include configured category identity in create diagnostics. -->
<!-- Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: send new private drafts to the authenticated edit route. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: diagnose the canonical Job authoring shape. -->
<template>
  <div class="space-y-3">
    
    <ClientOnly>
      
      <UCard v-if="agentCard">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm text-muted">Creator</p>
            <h2 class="text-lg font-semibold">Current agent</h2>
            <p class="text-sm text-muted">This agent will own the job posting.</p>
          </div>
        </template>

        
        <AgentCardsPill v-bind="agentCard" :show-subtitle="false" :link="true" />
      </UCard>

      
      <MoleculesCreateShell
        :loading="submitting"
        submit-label="Create"
        @clear="onReset"
        @submit="onSubmit"
      >
        <template #write>
          
          <JobCreateWrite v-model:form="form" />
        </template>

        <template #preview>
          
          <JobCreatePreview :form="form" />
        </template>
      </MoleculesCreateShell>

    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobCreate } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const router = useRouter()
const { form, reset, submit } = useJobCreate()
const { coreProfile, pill: agentInterface } = useAgent()

const agentCard = computed(() => (coreProfile.value ? agentInterface(coreProfile.value) : null))

const submitting = ref(false)

function onReset() {
  reset()
}

async function onSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const id = await submit()
    reset()
    router.push(`/jobs/edit/${encodeURIComponent(id)}`)
  } finally {
    submitting.value = false
  }
}

</script>
