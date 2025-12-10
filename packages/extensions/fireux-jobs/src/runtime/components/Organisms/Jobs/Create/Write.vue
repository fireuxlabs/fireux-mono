<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Job basics</p>
          <h2 class="text-lg font-semibold">Tell us about this role</h2>
          <p class="text-sm text-gray-500">
            Keep titles short and focused—professionals skim quickly.
          </p>
        </div>
      </template>

      <div class="space-y-5">
        <UFormGroup label="Job title" required :help="titleHelp">
          <UInput
            v-model="form.title"
            autofocus
            placeholder="e.g. Sous Chef (Evenings)"
            icon="i-lucide-briefcase"
          />
        </UFormGroup>

        <UFormGroup
          label="Shift summary"
          :help="'Responsibilities, requirements, schedule…'"
        >
          <UTextarea
            v-model="form.description"
            :rows="6"
            placeholder="Describe the work, expectations, and anything talent should know."
          />
        </UFormGroup>

        <UFormGroup
          label="Internal notes"
          :help="'Visible to your team only; not shared with talent.'"
        >
          <UTextarea
            v-model="form.notes"
            :rows="3"
            placeholder="Add prep notes, reminders, or onboarding details."
          />
        </UFormGroup>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Scheduling</p>
          <h2 class="text-lg font-semibold">When does the shift happen?</h2>
          <p class="text-sm text-gray-500">
            Partial details are fine—talent sees whatever you share.
          </p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormGroup label="Date">
          <UInput v-model="form.date" type="date" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Starts at">
            <UInput v-model="form.start_time" type="time" />
          </UFormGroup>
          <UFormGroup label="Ends at">
            <UInput v-model="form.end_time" type="time" />
          </UFormGroup>
        </div>

        <UFormGroup
          class="md:col-span-2"
          label="Location reference"
          :help="'Link to a saved location or enter a quick reference.'"
        >
          <UInput
            v-model="form.location_id"
            placeholder="Kitchen ID, venue slug, address snippet…"
            icon="i-lucide-map-pin"
          />
        </UFormGroup>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-sm text-gray-500">Compensation & status</p>
            <h2 class="text-lg font-semibold">How should we publish this job?</h2>
          </div>
          <UBadge :color="statusToneColor" variant="soft">
            {{ currentStatus.label }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-5">
        <UFormGroup label="Advertised pay" :help="payHelp">
          <UInput
            v-model="form.pay"
            placeholder="35 CHF/hour, negotiable"
            icon="i-lucide-badge-dollar-sign"
          />
        </UFormGroup>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormGroup label="Status" required>
            <USelect v-model="form.status" :options="statusChoices" />
          </UFormGroup>

          <div class="rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
            <p class="font-medium">{{ currentStatus.label }}</p>
            <p>{{ currentStatus.description }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold text-gray-700">Status reference</p>
          <ul class="space-y-2">
            <li
              v-for="meta in statusReference"
              :key="meta.value"
              class="rounded-lg border border-gray-100 p-3 text-sm"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="meta.icon" class="h-4 w-4 text-gray-400" />
                <span class="font-medium">{{ meta.label }}</span>
              </div>
              <p class="mt-1 text-gray-500">{{ meta.description }}</p>
            </li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobDraft } from '../../../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'
import {
  defaultJobStatus,
  jobStatusMeta,
  jobStatusOptions,
  jobStatusOrder,
  type JobStatusMeta,
} from '../../../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'
import type { JobStatus } from '../../../../models/job.model.ts'

const form = defineModel<JobDraft>('form', { required: true })

type StatusOption = { label: string; value: JobStatus }

const props = defineProps<{ statusOptions?: ReadonlyArray<StatusOption> }>()

const toneMap: Record<JobStatusMeta['tone'], string> = {
  neutral: 'gray',
  success: 'success',
  warning: 'warning',
  info: 'info',
  error: 'error',
}

const statusChoices = computed(() =>
  props.statusOptions && props.statusOptions.length > 0
    ? props.statusOptions
    : jobStatusOptions
)

const titleHelp = computed(() => {
  const remaining = Math.max(0, 80 - form.value.title.length)
  return `${remaining} characters remaining`
})
const payHelp = 'Optional. Mention hourly rate, day rate, or salary range.'

const currentStatus = computed(() => jobStatusMeta[form.value.status] ?? jobStatusMeta[defaultJobStatus])
const statusToneColor = computed(() => toneMap[currentStatus.value.tone])

const statusReference = computed(() =>
  jobStatusOrder.map((value) => ({
    value,
    label: jobStatusMeta[value].label,
    description: jobStatusMeta[value].description,
    icon: value === form.value.status ? 'i-lucide-check' : 'i-lucide-circle',
  }))
)
</script>
