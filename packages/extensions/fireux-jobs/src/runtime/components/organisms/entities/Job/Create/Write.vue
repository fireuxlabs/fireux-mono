<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create/Write.vue -->
<!-- NOTE for Copilot:
  - WRITE surface for job creation.
  - Must stay in sync with useJobCreate() form shape.
-->

<template>
  <div class="space-y-6">
    <JobCreateLocation
      v-model:form="form"
      step-label="Step 1"
      title="Location"
      :subtitle="
        'Every job must be anchored to a place. We store the place id on the job.'
      "
    />

    <JobCreateBasics
      v-model:form="form"
      step-label="Step 2"
      title="Job basics"
      subtitle="Capture the title, description, and status."
    />
  </div>
</template>

<script setup lang="ts">
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate';

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })
</script>
