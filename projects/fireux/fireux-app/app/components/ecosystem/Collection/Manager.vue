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

    <template v-else-if="filtered.length">
      <div
        v-if="variant === 'cell'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="entry in filtered"
          :key="entry.key"
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
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <UButton
              v-if="entry.href"
              size="xs"
              variant="soft"
              icon="i-lucide-arrow-up-right"
              :to="entry.href"
              external
              target="_blank"
            >
              Open
            </UButton>

            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-book-open"
              to="/ecosystems/learn-more"
            >
              Learn more
            </UButton>
          </div>
        </article>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in filtered"
          :key="entry.key"
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
            </div>
          </div>

          <UButton
            v-if="entry.href"
            size="xs"
            variant="soft"
            icon="i-lucide-arrow-up-right"
            :to="entry.href"
            external
            target="_blank"
          >
            Open
          </UButton>
        </div>
      </div>
    </template>

    <p v-else>
      {{ query ? 'No ecosystems match your search.' : 'No ecosystems found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type EcosystemRow = {
  key?: string
  name?: string
  src?: string
  text?: string
  href?: string
}

const props = withDefaults(defineProps<{
  collection?: EcosystemRow[]
  pending?: boolean
}>(), {
  collection: () => [],
  pending: false,
})

const query = ref('')
const variant = ref<'pill' | 'cell'>('cell')

const normalized = computed(() =>
  (props.collection ?? [])
    .map((row) => ({
      key: String(row.key || '').trim(),
      name: String(row.name || '').trim(),
      src: String(row.src || '').trim(),
      text: String(row.text || '').trim(),
      href: String(row.href || '').trim(),
    }))
    .filter((row) => Boolean(row.key || row.name))
)

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return normalized.value

  return normalized.value.filter((row) =>
    `${row.key} ${row.name}`.toLowerCase().includes(needle)
  )
})

const totalCount = computed(() => normalized.value.length)
const visibleCount = computed(() => filtered.value.length)

const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}
</script>
