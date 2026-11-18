<template>
  <Overview.Controls
    v-model="query"
    :count="results.length"
    :ready="summary.outcome === 'ready'"
  />
  <Overview.Collection
    :summary="summary"
    :preparations="results"
    :searching="Boolean(query.trim())"
  />
</template>
<script setup lang="ts">
import * as Overview from './index'
import { computed, ref } from 'vue'
import { requirePrepWorkspace } from '../../../../composables/workspace/prep/state'

const { summaries, preparations } = requirePrepWorkspace()
const query = ref('')
const summary = computed(() => summaries.value.preparations)
const results = computed(() => {
  if (summary.value.outcome !== 'ready') return []
  const search = query.value.trim().toLocaleLowerCase()
  return preparations.value.filter(({ name, description }) =>
    [name, description].some((text) =>
      text?.toLocaleLowerCase().includes(search)
    )
  )
})
</script>
