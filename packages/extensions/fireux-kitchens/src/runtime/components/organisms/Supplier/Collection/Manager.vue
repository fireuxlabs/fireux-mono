<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search suppliers..."
          />
          <UBadge variant="soft">{{ filtered.length }} / {{ prepared.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="filtered.length" class="space-y-2">
      <div
        v-for="entry in filtered"
        :key="entry.id"
        class="rounded-md border border-default p-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ entry.name }}</p>
            <p class="truncate text-xs text-dimmed">
              {{ entry.category || 'Uncategorized' }}
            </p>
          </div>
          <code class="text-[11px] text-dimmed">{{ entry.id }}</code>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type SupplierCollectionEntry = {
  id?: string
  name?: string
  category?: string
  supplier_headline?: string
  supplier_organization_name?: string
  title?: string
  business_type?: string
  supplier_product_categories?: string[]
  categories?: string[]
  tags?: string[]
}

type SupplierRow = {
  id: string
  name: string
  category: string
  search: string
}

const props = withDefaults(
  defineProps<{
    collection?: SupplierCollectionEntry[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Suppliers',
    description: 'Browse suppliers for this runtime.',
  }
)

const query = ref('')

const firstString = (values: unknown[]) =>
  values
    .map((value) => String(value || '').trim())
    .find(Boolean) || ''

const firstArrayString = (value: unknown) =>
  firstString(Array.isArray(value) ? value : [])

const collection = computed(() => props.collection ?? [])

const prepared = computed<SupplierRow[]>(() =>
  collection.value.map((entry, index) => {
    const id = String(entry.id || '').trim() || `supplier-${index + 1}`
    const name =
      firstString([
        entry.name,
        entry.supplier_organization_name,
        entry.supplier_headline,
        entry.title,
        id,
      ]) || id
    const category =
      firstString([
        entry.category,
        entry.business_type,
        firstArrayString(entry.supplier_product_categories),
        firstArrayString(entry.categories),
        firstArrayString(entry.tags),
      ]) || ''

    return {
      id,
      name,
      category,
      search: [id, name, category].join(' ').toLowerCase(),
    }
  })
)

const filtered = computed(() => {
  const q = String(query.value || '').trim().toLowerCase()
  if (!q) return prepared.value
  return prepared.value.filter((entry) => entry.search.includes(q))
})
</script>
