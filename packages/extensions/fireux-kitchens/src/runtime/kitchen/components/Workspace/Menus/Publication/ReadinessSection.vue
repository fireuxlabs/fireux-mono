<template>
  <div
    v-if="!hidden && report.result.issues.length"
    class="border-l-2 border-warning pl-3"
  >
    <NuxtLink
      :to="`/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(menuSlug)}/${encodeURIComponent(section.id)}`"
      class="text-sm font-medium"
      >{{ section.label || 'Section' }}</NuxtLink
    >
    <ul class="mt-1 space-y-1 text-sm text-muted">
      <li v-for="issue in report.result.issues" :key="issue.itemId">
        <span class="text-highlighted">{{ issue.name }}</span> —
        {{ issue.reason }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import type { useKitchenWorkspaceMenuSection } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuSectionItemCollection } from '../../../../../menu/composables/useMenuSectionItemCollection'
import {
  menuPublicationReadiness,
  type MenuReadiness,
} from '../../../../../menu/utils/publication-readiness'
const props = defineProps<{
  section: { id: string; label?: string }
  dishes: Record<string, unknown>[]
  promotions: Record<string, unknown>[]
  currency: string
  currentSection?: ReturnType<typeof useKitchenWorkspaceMenuSection>
  hidden?: boolean
}>()
const emit = defineEmits<{
  change: [report: { pending: boolean; error: unknown; result: MenuReadiness }]
}>()
const { storageKitchenId, menuId, menuSlug, rootCollection, databaseId } =
  useKitchenMenuRecordContext()
const source = props.currentSection
  ? {
      items: props.currentSection.items,
      pending: props.currentSection.itemsPending,
      error: props.currentSection.itemsError,
    }
  : useMenuSectionItemCollection(
      storageKitchenId,
      menuId,
      computed(() => props.section.id),
      { kitchenCollectionPath: rootCollection, databaseId }
    )
const report = computed(() => ({
  pending: source.pending.value,
  error: source.error.value,
  result: menuPublicationReadiness(
    [
      {
        ...props.section,
        items: source.items.value.map((item) => ({ ...item })),
      },
    ],
    new Map(props.dishes.map((d) => [String(d.id), d])),
    new Map(props.promotions.map((p) => [String(p.id), p])),
    props.currency
  ),
}))
watch(report, (value) => emit('change', value), { immediate: true })
</script>
