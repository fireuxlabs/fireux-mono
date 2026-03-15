<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Available Projects</div>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search projects…"
          />

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="pending" class="space-y-2">
      <USkeleton
        v-for="n in 4"
        :key="n"
        class="h-20 rounded-xl"
      />
    </div>

    <template v-else-if="cardsFiltered.length">
      <div class="space-y-2">
        <ProjectCardsPill
          v-for="entry in cardsFiltered"
          :key="entry.id"
          :to="''"
          :title="entry.title"
          :subtitle="entry.subtitle"
          :badges="entry.badges"
        />
      </div>
    </template>

    <p v-else>
      {{ query ? 'No projects match your search.' : 'No projects found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        title="Projects (JSON)"
        context="collection manager · projects · raw collection"
        :data="rawCollection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import ProjectCardsPill from '../Cards/Pill.vue'

type ProjectRow = {
  id?: string
  key?: string
  slug?: string
  name?: string
  status?: string
}

type NormalizedProjectRow = {
  id: string
  key: string
  name: string
  status: string
}

type ProjectCard = {
  id: string
  title: string
  subtitle: string
  badges: string[]
}

const props = withDefaults(defineProps<{
  collection?: ProjectRow[]
  pending?: boolean
}>(), {
  collection: () => [],
  pending: false,
})

const rawCollection = computed(() => props.collection ?? [])

const normalizeString = (value: unknown) => String(value || '').trim()

const collection = computed<NormalizedProjectRow[]>(() =>
  rawCollection.value
    .map((row) => {
      const id = normalizeString(row.id)
      const key = normalizeString(row.key) || id || normalizeString(row.slug)
      const name = normalizeString(row.name)
      const status = normalizeString(row.status) || 'active'

      return {
        id: id || key || name,
        key,
        name,
        status,
      }
    })
    .filter((row) => Boolean(row.id && (row.key || row.name)))
)

const {
  query,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<NormalizedProjectRow, ProjectCard>({
  items: collection,
  searchText: (row) =>
    `${row.key} ${row.name} ${row.status}`.trim().toLowerCase(),
  makeCard: (row) => ({
    id: row.id,
    title: row.name || row.key || 'Untitled project',
    subtitle: row.key || '',
    badges: [row.status],
  }),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>