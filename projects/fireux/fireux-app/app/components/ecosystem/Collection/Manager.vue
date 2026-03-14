<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Available Ecosystems</div>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search ecosystems…"
          />

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'"
            :aria-label="variant === 'pill' ? 'Switch to grid view' : 'Switch to list view'"
            @click="toggleVariant"
          />

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="pending" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton
        v-for="n in 6"
        :key="n"
        class="h-28 rounded-xl"
      />
    </div>

    <template v-else-if="cardsFiltered.length">
      <div
        v-if="variant === 'cell'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="entry in cardsFiltered"
          :key="entry.id"
          class="rounded-xl border border-default p-3"
        >
          <div class="flex items-start gap-3">
            <UAvatar
              :src="entry.src"
              :alt="entry.name"
              :text="entry.text"
              class="shrink-0"
            />

            <div class="min-w-0 space-y-1">
              <p class="truncate text-sm font-medium">{{ entry.name }}</p>
              <p class="truncate text-xs text-dimmed">{{ entry.key }}</p>
              <p class="truncate text-xs text-dimmed">
                team: {{ entry.team || 'unset' }} · apps: {{ entry.apps }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in cardsFiltered"
          :key="entry.id"
          class="flex items-center justify-between gap-3 rounded-xl border border-default p-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar
              :src="entry.src"
              :alt="entry.name"
              :text="entry.text"
              class="shrink-0"
            />
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ entry.name }}</p>
              <p class="truncate text-xs text-dimmed">{{ entry.key }}</p>
              <p class="truncate text-xs text-dimmed">
                team: {{ entry.team || 'unset' }} · apps: {{ entry.apps }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <p v-else>
      {{ query ? 'No ecosystems match your search.' : 'No ecosystems found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        title="Ecosystems (JSON)"
        context="collection manager · ecosystems · root: ecosystems"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'

type EcosystemRow = {
  key?: string
  name?: string
  src?: string
  text?: string
  href?: string
  apps?: number
  team?: string
}

type EcosystemCard = {
  id: string
  key: string
  name: string
  src: string
  text: string
  apps: number
  team: string
}

const props = withDefaults(defineProps<{
  collection?: EcosystemRow[]
  pending?: boolean
}>(), {
  collection: () => [],
  pending: false,
})

const collection = computed(() =>
  (props.collection ?? [])
    .map((row) => ({
      key: String(row.key || '').trim(),
      name: String(row.name || '').trim(),
      src: String(row.src || '').trim(),
      text: String(row.text || '').trim(),
      href: String(row.href || '').trim(),
      apps: Number.isFinite(Number(row.apps)) ? Number(row.apps) : 0,
      team: String(row.team || '').trim(),
    }))
    .filter((row) => Boolean(row.key || row.name))
)

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<EcosystemRow, EcosystemCard>({
  items: collection,
  searchText: (row) => `${row.key} ${row.name}`.trim().toLowerCase(),
  makeCard: (row) => ({
    id: row.key || row.name || '',
    key: row.key || '',
    name: row.name || row.key || 'Untitled ecosystem',
    src: row.src || '',
    text: row.text || '',
    apps: Number.isFinite(Number(row.apps)) ? Number(row.apps) : 0,
    team: row.team || '',
  }),
  initialVariant: 'cell',
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev
</script>
