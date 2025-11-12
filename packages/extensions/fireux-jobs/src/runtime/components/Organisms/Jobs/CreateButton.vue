<template>
  <div class="flex items-center gap-2">
    <UTooltip
      v-if="!canCreate"
      text="Create an employer profile first to post jobs."
      :open-delay="200"
    >
      <span>
        <UButton icon="i-lucide-briefcase" color="primary" disabled>
          New Job
        </UButton>
      </span>
    </UTooltip>

    <UButton
      v-else
      icon="i-lucide-briefcase"
      color="primary"
      :loading="submitting"
      @click="open = true"
    >
      New Job
    </UButton>

    <UModal v-model="open">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">Create Job</h3>
            <p class="text-sm text-gray-500">
              Draft a new job posting. You can refine the details after
              creation.
            </p>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <UFormGroup label="Job title" required>
            <UInput v-model="form.title" placeholder="E.g. Lead Cleaner" />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="form.description"
              placeholder="Short summary of the opportunity"
              :rows="4"
            />
          </UFormGroup>

          <UFormGroup label="Pay range">
            <UInput
              v-model="form.pay"
              placeholder="E.g. $25/hr"
              icon="i-lucide-badge-dollar-sign"
            />
          </UFormGroup>

          <template v-if="errorMessage">
            <div class="text-sm text-red-500">{{ errorMessage }}</div>
          </template>
        </form>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton variant="ghost" @click="onClose">Cancel</UButton>
            <UButton
              color="primary"
              :loading="submitting"
              :disabled="!form.title.trim() || submitting"
              @click="onSubmit"
            >
              Create Job
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobs } from '../../../composables/firestore/jobs/main/useJobs.ts'
import { useEmployer } from '../../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useEmployerComputed } from '../../../composables/firestore/profiles/Employer/main/useEmployerComputed.ts'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify.ts'

const router = useRouter()
const { createJob } = useJobs()
const { success, error } = useToastify()

const { profile } = useEmployer()
const { activeProfile } = useEmployerComputed(profile)
const canCreate = computed(() => Boolean(activeProfile.value))

const open = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  title: '',
  description: '',
  pay: '',
})

function resetForm() {
  form.title = ''
  form.description = ''
  form.pay = ''
  errorMessage.value = ''
}

function onClose() {
  open.value = false
  resetForm()
}

async function onSubmit() {
  if (!form.title.trim()) {
    errorMessage.value = 'A job title is required.'
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''
    const id = (await createJob({
      title: form.title.trim(),
      description: form.description.trim() || null,
      pay: form.pay.trim() || null,
    })) as string

    success('Draft job created.')
    onClose()
    router.push(`/jobs/${id}`)
  } catch (err) {
    error('Unable to create job. Please try again.')
    if (err instanceof Error) {
      errorMessage.value = err.message
    }
  } finally {
    submitting.value = false
  }
}
</script>
