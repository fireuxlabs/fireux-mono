<template>
  <UPage>
    <UPageHeader
      title="Create Misebox Job"
      description="Post a Misebox gig to reach chefs already in the network."
    />

    <UPageBody class="pagebody">
      <UAlert
        v-if="!canCreate"
        color="amber"
        variant="soft"
        title="Create an agent profile"
        description="Finish your Misebox agent profile from the dashboard to unlock job postings."
      />

      <form v-else class="space-y-4" @submit.prevent="onSubmit">
        <UFormGroup label="Job title" required>
          <UInput v-model="form.title" placeholder="e.g. Mise en place lead" />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Responsibilities, menu focus, and scheduling details."
            :rows="6"
          />
        </UFormGroup>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormGroup label="Pay">
            <UInput
              v-model="form.pay"
              placeholder="35 CHF/hour"
              icon="i-lucide-badge-dollar-sign"
            />
          </UFormGroup>

          <UFormGroup label="Status" required>
            <USelect v-model="form.status" :options="statusOptions" />
          </UFormGroup>
        </div>

        <div v-if="errorMessage" class="text-sm text-red-500">
          {{ errorMessage }}
        </div>

        <div class="flex items-center justify-end gap-2">
          <UButton variant="ghost" :disabled="submitting" @click="onReset">
            Clear
          </UButton>
          <UButton
            color="primary"
            :loading="submitting"
            :disabled="!isValid"
            type="submit"
          >
            Publish draft
          </UButton>
        </div>
      </form>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify.ts'
import { useAgent } from '../../../../../../extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useAgentComputed } from '../../../../../../extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentComputed.ts'
import type { JobStatus } from '../../../../../../extensions/fireux-jobs/src/runtime/models/job.model.ts'

definePageMeta({
  layout: 'default',
})

useHead({ title: 'Create Misebox Job' })

const router = useRouter()
const { createJob } = useJobCreate()
const { profile } = useAgent()
const { activeProfile } = useAgentComputed(profile)
const { withToast } = useToastify()

const form = reactive({
  title: '',
  description: '',
  pay: '',
  status: 'draft' as JobStatus,
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
] as const

const submitting = ref(false)
const errorMessage = ref('')
const canCreate = computed(() => Boolean(activeProfile.value))
const isValid = computed(
  () => canCreate.value && form.title.trim().length > 0 && Boolean(form.status)
)

function onReset() {
  form.title = ''
  form.description = ''
  form.pay = ''
  form.status = 'draft'
  errorMessage.value = ''
}

const onSubmit = withToast(
  async () => {
    if (!isValid.value) return
    submitting.value = true
    errorMessage.value = ''

    try {
      const id = await createJob({
        title: form.title.trim(),
        description: form.description.trim() || null,
        pay: form.pay.trim() || null,
        status: form.status,
      })

      onReset()
      router.push(`/jobs/${id}`)
    } catch (error) {
      if (error instanceof Error) {
        errorMessage.value = error.message
      }
      throw error
    } finally {
      submitting.value = false
    }
  },
  { ok: 'Job created', fail: 'Unable to create job' }
)
</script>
