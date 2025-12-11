<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Job basics</p>
          <h2 class="text-lg font-semibold">Lock a title and status</h2>
          <p class="text-sm text-gray-500">
            Keep titles short and focused—pipelines stay cleaner that way.
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
import type { JobDraft } from '../../../../composables/fireux/firestore/jobs/state/useJobState.ts'
import {
  defaultJobStatus,
  jobStatusMeta,
  jobStatusOptions,
  jobStatusOrder,
} from '../../../../composables/fireux/firestore/jobs/state/useJobState.ts'
import type { JobStatus } from '#fireux-jobs-models/job.model'

const form = defineModel<JobDraft>('form', { required: true })

type StatusOption = { label: string; value: JobStatus }

const props = defineProps<{ statusOptions?: ReadonlyArray<StatusOption> }>()

const statusChoices = computed(() =>
  props.statusOptions && props.statusOptions.length > 0
    ? props.statusOptions
    : jobStatusOptions
)

const titleHelp = computed(() => {
  const remaining = Math.max(0, 80 - form.value.title.length)
  return `${remaining} characters remaining`
})

const currentStatus = computed(() => jobStatusMeta[form.value.status] ?? jobStatusMeta[defaultJobStatus])

const statusReference = computed(() =>
  jobStatusOrder.map((value) => ({
    value,
    label: jobStatusMeta[value].label,
    description: jobStatusMeta[value].description,
    icon: value === form.value.status ? 'i-lucide-check' : 'i-lucide-circle',
  }))
)
</script>
