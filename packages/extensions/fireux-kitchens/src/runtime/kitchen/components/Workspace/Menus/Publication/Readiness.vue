<template>
  <section aria-label="Publication readiness" class="mb-4 space-y-3">
    <MoleculesCopyError v-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status" class="text-sm text-muted">
      Checking Menu content…
    </p>
    <UAlert
      v-else-if="empty"
      color="warning"
      :title="
        menu?.status === 'published'
          ? 'This published Menu has no available items'
          : 'Add available items before publishing'
      "
      :description="
        menu?.status === 'published'
          ? 'Guests currently have no food or drinks to view. Add or restore content, or unpublish this Menu.'
          : 'Add a Dish or active meal deal to a section.'
      "
    />
    <div class="space-y-3">
      <WorkspaceKitchenMenusPublicationReadinessSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
        :current-section="
          props.sectionContext?.sectionId.value === section.id
            ? props.sectionContext
            : undefined
        "
        :dishes="dishes.items.value"
        :promotions="promotions.items.value"
        :currency="currencyCode"
        :hidden="Boolean(error) || pending"
        @change="(report) => reports.set(section.id, report)"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useKitchenChildCollection } from '../../../../composables/useKitchenChildCollection'
import type { useKitchenWorkspaceMenuSection } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import type { MenuReadiness } from '../../../../../menu/utils/publication-readiness'
const props = defineProps<{
  sectionContext?: ReturnType<typeof useKitchenWorkspaceMenuSection>
}>()
const {
  menu,
  sections,
  storageKitchenId,
  rootCollection,
  databaseId,
  sectionsPending,
  sectionsError,
  currencyCode,
} = useKitchenMenuRecordContext()
const options = { kitchenCollectionPath: rootCollection, databaseId }
const dishes = props.sectionContext
  ? {
      items: computed(() =>
        props.sectionContext!.dishes.value.map((dish) => ({ ...dish }))
      ),
      pending: props.sectionContext.dishSource.pending,
      error: props.sectionContext.dishSource.error,
    }
  : useKitchenChildCollection<Record<string, unknown>>(
      'dishes',
      storageKitchenId,
      options
    )
const promotions = props.sectionContext
  ? {
      items: computed(() =>
        props.sectionContext!.promotions.items.value.map((promotion) => ({
          ...promotion,
        }))
      ),
      pending: props.sectionContext.promotions.pending,
      error: props.sectionContext.promotions.error,
    }
  : useKitchenChildCollection<Record<string, unknown>>(
      'promotions',
      storageKitchenId,
      options
    )
const reports = reactive(
  new Map<string, { pending: boolean; error: unknown; result: MenuReadiness }>()
)
const pending = computed(
  () =>
    sectionsPending.value ||
    dishes.pending.value ||
    promotions.pending.value ||
    sections.value.some((s) => !reports.has(s.id) || reports.get(s.id)!.pending)
)
const error = computed(
  () =>
    sectionsError.value ||
    dishes.error.value ||
    promotions.error.value ||
    sections.value.map((s) => reports.get(s.id)?.error).find(Boolean)
)
const empty = computed(
  () =>
    !pending.value &&
    !error.value &&
    !sections.value.some((s) => reports.get(s.id)?.result.availableCount)
)
</script>
