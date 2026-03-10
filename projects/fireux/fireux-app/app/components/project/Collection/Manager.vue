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

    <template v-else-if="filtered.length">
      <div class="space-y-2">
        <ProjectCardsPill
          v-for="entry in filtered"
          :key="entry.key"
          :to="''"
          :title="entry.name"
          :subtitle="entry.key"
          :badges="[entry.status || 'active']"
        />
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="query ? 'No projects match your search' : 'No projects found yet'"
      description="Create and manage projects from the FireUX project console."
    >
      <template #actions>
        <UButton
          to="/console/projects/overview"
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-layout-dashboard"
        >
          Enter Project Console
        </UButton>
      </template>
    </UAlert>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProjectCardsPill from '../Cards/Pill.vue'

type ProjectRow = {
  key?: string
  name?: string
  status?: string
}

const props = withDefaults(defineProps<{
  collection?: ProjectRow[]
  pending?: boolean
}>(), {
  collection: () => [],
  pending: false,
})

const query = ref('')

const normalized = computed(() =>
  (props.collection ?? [])
    .map((row) => ({
      key: String(row.key || '').trim(),
      name: String(row.name || '').trim(),
      status: String(row.status || '').trim(),
    }))
    .filter((row) => Boolean(row.key || row.name))
)

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return normalized.value

  return normalized.value.filter((row) =>
    `${row.key} ${row.name} ${row.status}`.toLowerCase().includes(needle)
  )
})

const totalCount = computed(() => normalized.value.length)
const visibleCount = computed(() => filtered.value.length)
</script>
