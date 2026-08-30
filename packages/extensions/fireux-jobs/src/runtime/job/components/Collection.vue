<template>
  <section id="open-jobs" class="entity-collection job-collection">
    <CollectionHeader title="Open opportunities" description="Explore roles, meet the employer, and understand the work before you apply.">
      <template #controls>
        <UInput v-if="jobs.length > 15" v-model="query" placeholder="Search jobs…" aria-label="Search jobs" icon="i-lucide-search" class="entity-collection__search" />
        <span class="entity-collection__count">{{ visibleCount }} jobs</span>
      </template>
    </CollectionHeader>
    <JobCollectionList :cards="cards" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import type { JobDirectoryEntry } from '../models/job-collection.model.ts'
import { useJobInterface, type JobCard } from '../composables/firestore/utils/view/useJobInterface'

const props = defineProps<{
  jobs: JobDirectoryEntry[]
}>()
const jobs = computed(() => props.jobs)
const { cell } = useJobInterface()
const { query, visibleItems, visibleCount } = useCollectionSearch({ items: jobs, makeCard: cell, initialVariant: 'cell' })
const cards = computed<JobCard.Card[]>(() =>
  visibleItems.value.flatMap((job) => {
    const card = cell(job)
    return card ? [card] : []
  })
)
</script>
