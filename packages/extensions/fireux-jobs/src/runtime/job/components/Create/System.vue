<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: include configured category identity in create diagnostics. -->
<!-- Concurrent edit — 2026-07-21 12:53 CEST — Job authoring: send new drafts to the authenticated edit route. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: diagnose the canonical Job authoring shape. -->
<template>
  <div class="space-y-3">
    <ClientOnly>
      <UCard v-if="agentCard">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm text-muted">Creator</p>
            <h2 class="text-lg font-semibold">Current hiring profile</h2>
            <p class="text-sm text-muted">
              This hiring profile will own the job posting.
            </p>
          </div>
        </template>

        <AgentCardsPill
          v-bind="agentCard"
          :show-subtitle="false"
          :link="true"
        />
      </UCard>

      <FireCreateShell
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
      </FireCreateShell>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobCreate } from '../../composables/firestore/mutations/useJobCreate.ts'
import { useAgent } from '../../../user/composables/profiles/Agent/useAgent'

const router = useRouter()
const { form, reset, submit, captureIntent, scopeEpoch } = useJobCreate()
const { agentProfile, pill: agentInterface } = useAgent()

const agentCard = computed(() =>
  agentProfile.value ? agentInterface(agentProfile.value) : null
)

const submitting = ref(false)
watch(scopeEpoch, () => { submitting.value = false }, { flush: 'sync' })

function onReset() {
  reset()
}

async function onSubmit() {
  if (submitting.value) return
  const isCurrent = captureIntent()
  submitting.value = true
  try {
    const id = await submit()
    if (!isCurrent()) return
    reset()
    router.push(`/jobs/edit/${encodeURIComponent(id)}`)
  } finally {
    if (isCurrent()) submitting.value = false
  }
}
</script>
