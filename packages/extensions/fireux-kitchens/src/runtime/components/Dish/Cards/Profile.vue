<template>
  <UCard v-if="dish">
    <div class="space-y-6">
      <div class="flex items-start gap-3">
        <UAvatar
          icon="i-lucide-utensils"
          size="lg"
          class="shrink-0"
        />

        <div class="min-w-0 space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ dish.name }}
          </h2>
          <p
            v-if="dish.description"
            class="max-w-2xl text-sm text-dimmed"
          >
            {{ dish.description }}
          </p>
        </div>
      </div>

      <div class="console-summary-grid">
        <div class="console-summary-field">
          Names:
          <span class="console-summary-value">{{ nameCount }}</span>
        </div>
        <div class="console-summary-field">
          Descriptions:
          <span class="console-summary-value">{{ descriptionCount }}</span>
        </div>
      </div>

      <section class="space-y-3">
        <div class="text-sm font-semibold text-highlighted">
          Attached copy
        </div>

        <div
          v-if="copyRows.length"
          class="divide-y divide-default rounded-md border border-default"
        >
          <div
            v-for="row in copyRows"
            :key="row.language"
            class="grid gap-2 px-3 py-3 text-sm sm:grid-cols-[64px_1fr]"
          >
            <div class="font-medium text-toned">
              {{ row.language }}
            </div>

            <div class="min-w-0 space-y-1">
              <div class="break-words font-medium text-highlighted">
                {{ row.name || '—' }}
              </div>
              <div class="break-words text-dimmed">
                {{ row.description || '—' }}
              </div>
            </div>
          </div>
        </div>

        <p
          v-else
          class="text-sm text-dimmed"
        >
          No attached language copy yet.
        </p>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../models/dish.model'

const props = defineProps<{
  dish: Dish | null
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [normalizeString(key), normalizeString(entry)])
      .filter(([key, entry]) => Boolean(key && entry))
  )
}

const names = computed(() => normalizeStringMap(props.dish?.names))
const descriptions = computed(() => normalizeStringMap(props.dish?.descriptions))
const copyRows = computed(() =>
  ['de', 'en']
    .map((language) => ({
      language,
      name: names.value[language] || '',
      description: descriptions.value[language] || '',
    }))
    .filter((row) => row.name || row.description)
)
const nameCount = computed(
  () => copyRows.value.filter((row) => row.name).length
)
const descriptionCount = computed(
  () => copyRows.value.filter((row) => row.description).length
)
</script>
