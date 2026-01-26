<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Jobs</div>
          <p>Browse jobs available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search jobs…"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsEntitiesJobCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <JobCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <JobCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesJobCollectionList>

    <p v-else>
      {{ query ? 'No jobs match your search.' : 'No jobs found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Jobs (JSON)'"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useJobInterface } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface';
import type { Job } from '../../../../../models/objects/job.model';

const props = defineProps<{ collection?: Job[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useJobInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Job, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (job: Job) => searchText(job),
  makeCard: (job: Job) => makeCard(job),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev

</script>

