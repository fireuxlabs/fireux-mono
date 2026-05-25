<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Basics.vue -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">
          {{ props.stepLabel }} · {{ props.title }}
        </p>
        <h2 class="text-lg font-semibold">{{ props.title }}</h2>
        <p v-if="props.subtitle" class="text-sm text-gray-500">
          {{ props.subtitle }}
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <UFormField label="Job title" required>
        <UInput
          v-model="form.title"
          autofocus
          placeholder="e.g. Sous Chef (Evenings)"
          icon="i-lucide-briefcase"
        />
      </UFormField>

      <UFormField label="Job description" required>
        <UTextarea
          v-model="form.description"
          placeholder="What is the job, roughly when, and what are you looking for?"
          :rows="7"
        />
      </UFormField>

      <UFormField label="Status" required>
        <USelect v-model="form.status" :options="statusOptions" />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { JobCreateForm } from '../../../../composables/fireux/firestore/jobs/mutations/useJobCreate';

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

const props = withDefaults(
  defineProps<{
    stepLabel?: string
    title?: string
    subtitle?: string
  }>(),
  {
    stepLabel: 'Step 2',
    title: 'Job basics',
    subtitle: '',
  }
)

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })
</script>
