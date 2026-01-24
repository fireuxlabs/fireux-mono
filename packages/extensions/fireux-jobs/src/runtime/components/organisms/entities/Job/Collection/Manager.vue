<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Jobs</div>
          <p class="text-xs text-dimmed">Browse jobs available to this runtime.</p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search jobs…"
            class="w-44"
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
    />

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No jobs match your search.' : 'No jobs found.' }}
    </p>

    <div v-if="isDev" class="pt-3">
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

