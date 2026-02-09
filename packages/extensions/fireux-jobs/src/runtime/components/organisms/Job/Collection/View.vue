<template>
  <JobCollectionManager :collection="collection" />
</template>

<script setup lang="ts">
import type { Job } from '../../../../../models/job.model';

withDefaults(
  defineProps<{
    collection: Job[]
  }>(),
  {}
)
</script>
