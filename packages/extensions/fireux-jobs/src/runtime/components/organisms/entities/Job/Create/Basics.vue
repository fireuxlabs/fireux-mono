<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Step 2 · Job basics</p>
        <h2 class="text-lg font-semibold">Write the core details</h2>
        <p class="text-sm text-gray-500">
          Capture the job basics and required links for the model.
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <UFormGroup label="Job title" required>
        <UInput
          v-model="form.title"
          autofocus
          placeholder="e.g. Sous Chef (Evenings)"
          icon="i-lucide-briefcase"
        />
      </UFormGroup>

      <UFormGroup label="Job description" required>
        <UTextarea
          v-model="form.description"
          placeholder="What is the job, roughly when, and what are you looking for?"
          :rows="7"
        />
      </UFormGroup>

      <div class="grid gap-5 md:grid-cols-2">
        <UFormGroup label="Company id (optional)">
          <UInput v-model="form.company_id" placeholder="Company overlay id" />
        </UFormGroup>

        <UFormGroup label="Status" required>
          <USelect v-model="form.status" :options="statusOptions" />
        </UFormGroup>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate';

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })
</script>
