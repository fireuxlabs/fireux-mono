<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Write.vue -->
<!-- NOTE for Copilot:
  - This is the WRITE surface for job creation.
  - It must stay in sync with useJobCreate() form shape.
-->

<template>
  <div class="space-y-6">
    <JobCreateLocation v-model:form="form" />

    <JobCreateCompany v-model:form="form" />

    <JobCreateBasics
      v-model:form="form"
      step-label="Step 3"
      title="Job basics"
      subtitle="Capture the title, description, and status."
    />
  </div>
</template>

<script setup lang="ts">
import type { JobCreateForm } from '../../../../composables/fireux/firestore/jobs/mutations/useJobCreate';

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })
</script>
