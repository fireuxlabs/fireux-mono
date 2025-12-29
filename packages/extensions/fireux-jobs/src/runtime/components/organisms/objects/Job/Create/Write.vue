<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create/Write.vue -->
<!-- NOTE for Copilot:
     - This is the WRITE surface for job creation.
     - It must stay in sync with useJobCreate() form shape: { title, description }.
     - No status, no extra fields until the pipeline is proven.
-->

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Job basics</p>
          <h2 class="text-lg font-semibold">Write the core details</h2>
          <p class="text-sm text-gray-500">
            Keep the title short and the description clear. The pipeline uses these fields directly.
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

        <UFormGroup label="Job description">
          <UTextarea
            v-model="form.description"
            placeholder="What is the job, roughly when, and what are you looking for?"
            :rows="6"
          />
        </UFormGroup>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
type JobCreateForm = {
  title: string
  description: string
}

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })
</script>
