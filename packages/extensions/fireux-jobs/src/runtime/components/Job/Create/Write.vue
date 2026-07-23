<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Write.vue -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: describe the complete canonical Job details step. -->
<!-- NOTE for Copilot:
  - This is the WRITE surface for job creation.
  - It must stay in sync with useJobCreate() form shape.
-->

<template>
  <div class="space-y-6">
    <JobCreateCompany v-model:form="form" />

    <JobCreateLocation v-model:form="form" />

    <JobCreateBasics
      v-model:form="form"
      step-label="Step 3"
      title="Job details"
      subtitle="Capture the role, contract, schedule, openings, and optional compensation."
    />
  </div>
</template>

<script setup lang="ts">
import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })
</script>
