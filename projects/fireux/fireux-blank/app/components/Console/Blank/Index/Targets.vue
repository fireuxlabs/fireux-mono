<template>
  <section class="space-y-2">
    <pre>ConsoleBlankIndexTargets</pre>

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Choose Blank</h2>
            <p>Select the Blank console target you want to work on.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">
        Loading Blank targets...
      </p>

      <div v-else-if="cards.length" class="grid gap-3 md:grid-cols-2">
        <ConsoleTargetCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          action
          :show-badges="false"
          @action="selectBlank(card.id)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No Blank targets found.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Blank } from '../../../../models/blank.model'

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const text = (value: unknown) => String(value ?? '').trim()
const consoleBlankIds = computed(() =>
  props.collection.map((blank) => text(blank.id)).filter(Boolean)
)
const consoleBlankIdSet = computed(() => new Set(consoleBlankIds.value))
const cards = computed(() =>
  props.collection
    .map((blank) => {
      const id = text(blank.id)
      if (!id) return null

      return {
        id,
        title: text(blank.name) || id,
        subtitle: text(blank.status),
        meta: id,
        badges: [text(blank.status)].filter(Boolean),
      }
    })
    .filter((card): card is NonNullable<(typeof card)> => Boolean(card))
)

function selectBlank(id: string) {
  if (!consoleBlankIdSet.value.has(text(id))) return
  emit('select', id)
}
</script>
