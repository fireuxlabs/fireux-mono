<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: include configured category identity in create diagnostics. -->
<!-- Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: send new private drafts to the authenticated edit route. -->
<template>
  <div class="space-y-3">
    
    <ClientOnly>
      
      <UCard v-if="agentCard">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm text-muted">Creator</p>
            <h2 class="text-lg font-semibold">Current agent</h2>
            <p class="text-sm text-muted">This job will be stamped to this agent.</p>
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
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFireuxJobsConfig } from '../../../composables/config/useFireuxJobsConfig'
import { useJobCreate } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const router = useRouter()
const jobsConfig = useFireuxJobsConfig()
const { form, reset, submit } = useJobCreate()
const { coreUser } = useUser()
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

const check = computed(() => {
  const missing: string[] = []

  if (
    jobsConfig.categories.length > 0 &&
    !String(form.value.category_id ?? '').trim()
  ) {
    missing.push('category_id')
  }
  if (!String(form.value.workplace_id ?? '').trim()) missing.push('workplace_id')
  if (!String(form.value.workplace_type ?? '').trim()) missing.push('workplace_type')
  if (!String(form.value.title ?? '').trim()) missing.push('title')
  if (!String(form.value.description ?? '').trim()) missing.push('description')

  const desc = String(form.value.description ?? '')
  const hasTbd = /\bTBD\b/i.test(desc)
  if (hasTbd) missing.push('description: replace TBD sections')

  return {
    status: missing.length ? 'incomplete' : 'ready',
    agentId: coreUser.value?.id ?? null,
    missing,
    notCapturedYet: ['schedule fields', 'compensation fields'],
    form: {
      category_id: String(form.value.category_id ?? '').trim(),
      workplace_type: String(form.value.workplace_type ?? '').trim(),
      workplace_id: String(form.value.workplace_id ?? '').trim(),
      workplace_label: String(form.value.workplace_label ?? '').trim(),
      company_id: String(form.value.company_id ?? '').trim(),
      title: String(form.value.title ?? '').trim(),
      status: String(form.value.status ?? 'open'),
      description: String(form.value.description ?? '').trim(),
    },
  }
})
</script>
