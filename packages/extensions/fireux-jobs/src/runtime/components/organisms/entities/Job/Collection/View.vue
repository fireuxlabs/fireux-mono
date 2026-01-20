<template>
  <JobCollectionManager :collection="collection" />
</template>

<script setup lang="ts">
import type { Job } from '../../../../../models/objects/job.model';

withDefaults(
  defineProps<{
    collection: Job[]
  }>(),
  {}
)
</script>
