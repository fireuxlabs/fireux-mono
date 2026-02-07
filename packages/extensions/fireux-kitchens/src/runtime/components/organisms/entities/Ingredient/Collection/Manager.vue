<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Ingredients</div>
          <p>Browse global ingredients available to this runtime.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search ingredients..."
          />
          <UBadge variant="soft">{{ filtered.length }} / {{ collection.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="filtered.length" class="space-y-2">
      <div
        v-for="ingredient in filtered"
        :key="ingredient.id"
        class="rounded-md border p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="font-medium">{{ ingredient.name }}</div>
            <div class="text-xs text-dimmed">
              Unit: {{ ingredient.unit || 'piece' }} · Supplier: {{ ingredient.supplier_name || '—' }}
            </div>
            <div class="text-xs text-dimmed">
              Storage: {{ ingredient.storage_location || '—' }}
            </div>
          </div>

          <div class="text-right text-xs text-dimmed">
            <div>On hand: {{ ingredient.on_hand_qty ?? 0 }}</div>
            <div>Par: {{ ingredient.par_qty ?? 0 }}</div>
            <div>Reorder: {{ ingredient.reorder_qty ?? 0 }}</div>
            <div>Cost: {{ ingredient.cost_per_unit ?? 0 }} {{ ingredient.currency || 'CHF' }}</div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No ingredients match your search.' : 'No ingredients found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        title="Ingredients (JSON)"
        context="Ingredients collection manager · global runtime collection"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ingredient } from '../../../../../models/objects/ingredient.model'

const props = defineProps<{
  collection?: Ingredient[]
}>()

const query = ref('')

const collection = computed(() => props.collection ?? [])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const items = collection.value
  if (!q) return items

  return items.filter((ingredient) => {
    const name = String(ingredient.name || '').toLowerCase()
    const supplier = String(ingredient.supplier_name || '').toLowerCase()
    const storage = String(ingredient.storage_location || '').toLowerCase()
    return name.includes(q) || supplier.includes(q) || storage.includes(q)
  })
})

const isDev = import.meta.dev
</script>
