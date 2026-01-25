<template>
  <div class="space-y-3">
    <p class="text-xs text-gray-500">Hello* 1 System</p>
    <ClientOnly>
      <p class="text-xs text-gray-500">Hello* 2 ClientOnly</p>
      <UCard v-if="agentCard">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Creator</p>
            <h2 class="text-lg font-semibold">Current agent</h2>
            <p class="text-sm text-gray-500">This job will be stamped to this agent.</p>
          </div>
        </template>

        <p class="text-xs text-gray-500">Hello* 3 AgentCard</p>
        <OrganismsProfilesAgentCardsPill v-bind="agentCard" :show-subtitle="false" :link="true" />
      </UCard>

      <p class="text-xs text-gray-500">Hello* 4 CreateShell</p>
      <MoleculesCreateShell
        :loading="submitting"
        submit-label="Create"
        @clear="onReset"
        @submit="onSubmit"
      >
        <template #write>
          <p class="text-xs text-gray-500">Hello* 5 WriteSlot</p>
          <JobCreateWrite v-model:form="form" />
        </template>

        <template #preview>
          <p class="text-xs text-gray-500">Hello* 6 PreviewSlot</p>
          <JobCreatePreview :form="form" />
        </template>
      </MoleculesCreateShell>

      <!-- DEV scaffold check (temporary) -->
      <pre
        v-if="showCheck"
        class="text-xs text-slate-500 whitespace-pre-wrap"
      >{{ JSON.stringify(check, null, 2) }}</pre>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobCreate } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

const router = useRouter()
const { form, reset, submit } = useJobCreate()
const { coreUser } = useUser()
const { coreProfile, card } = useAgent()

const agentCard = computed(() => (coreProfile.value ? card(coreProfile.value) : null))

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
    router.push(`/jobs/${id}`)
  } finally {
    submitting.value = false
  }
}

const showCheck = import.meta.dev
const check = computed(() => {
  const missing: string[] = []

  if (!String(form.value.kitchen_id ?? '').trim()) missing.push('kitchen_id')
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
      kitchen_id: String(form.value.kitchen_id ?? '').trim(),
      company_id: String(form.value.company_id ?? '').trim(),
      title: String(form.value.title ?? '').trim(),
      status: String(form.value.status ?? 'open'),
      description: String(form.value.description ?? '').trim(),
    },
  }
})
</script>

