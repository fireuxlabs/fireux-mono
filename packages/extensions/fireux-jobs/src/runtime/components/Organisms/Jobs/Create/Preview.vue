<template>
  <div class="space-y-2 text-sm text-gray-600">
    <p>
      <strong>{{ form.title || 'Untitled job' }}</strong>
    </p>
    <p v-if="form.date">Date: {{ form.date }}</p>
    <p v-if="form.start_time || form.end_time">
      Time: {{ form.start_time || '—' }} - {{ form.end_time || '—' }}
    </p>
    <p v-if="form.location_id">Location: {{ form.location_id }}</p>
    <p>Status: {{ form.status }}</p>
    <p v-if="form.pay">Pay: {{ form.pay }}</p>
    <p v-if="form.description">{{ form.description }}</p>
    <p v-if="form.notes">Notes: {{ form.notes }}</p>
  </div>
</template>

<script setup lang="ts">
import type { JobDraft } from '../../../../composables/fireux/firestore/jobs/job/state/useJobCreateState.ts'

defineProps<{ form: JobDraft }>()
</script>
