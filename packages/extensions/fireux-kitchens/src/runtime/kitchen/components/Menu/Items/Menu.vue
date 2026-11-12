<template>
  <UCard v-if="!settledEmpty">
    <template #header>
      <div class="card__header">
        <NuxtLink
          :to="`/workspace/kitchen/menu/menus/${encodeURIComponent(menu.slug)}`"
          @click="rememberView(menu.slug, 'content', $event)"
          >{{ menu.name }}</NuxtLink
        >
        <UBadge
          :color="menu.status === 'published' ? 'success' : 'neutral'"
          variant="subtle"
          >{{ menu.status === 'published' ? 'Published' : 'Draft' }}</UBadge
        >
      </div>
    </template>
    <FireCopyError v-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading sections…</p>
    <template v-else>
      <DishMenuSection
        v-for="section in sections"
        :key="section.id"
        :menu="menu"
        :section="section"
        @result="results[section.id] = $event"
      />
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { useMenuRecordNavigation } from '../../../composables/workspace/menus/useMenuRecordNavigation'
const { rememberView } = useMenuRecordNavigation()
import { computed, reactive, watch } from 'vue'
import type { Menu } from '../../../../menu/models/menu.model'
import DishMenuSection from './MenuSection.vue'
import { useKitchenItemDetail } from '../../../composables/dish/useKitchenItemDetailContext'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
const props = defineProps<{ menu: Menu }>()
const { storageKitchenId, databaseId, rootCollection } = useKitchenItemDetail()
const { sections, pending, error } = useMenuSectionCollection(
  storageKitchenId,
  computed(() => props.menu.id),
  { databaseId, kitchenCollectionPath: rootCollection }
)
const emit = defineEmits<{
  result: [value: 'pending' | 'error' | 'empty' | 'match']
}>()
const results = reactive<
  Record<string, 'pending' | 'error' | 'empty' | 'match'>
>({})
const settledEmpty = computed(
  () =>
    !pending.value &&
    !error.value &&
    sections.value.every((section) => results[section.id] === 'empty')
)
watch(
  [pending, error, sections, () => JSON.stringify(results)],
  () => {
    emit(
      'result',
      error.value ||
        sections.value.some((section) => results[section.id] === 'error')
        ? 'error'
        : pending.value ||
            sections.value.some(
              (section) =>
                !results[section.id] || results[section.id] === 'pending'
            )
          ? 'pending'
          : settledEmpty.value
            ? 'empty'
            : 'match'
    )
  },
  { immediate: true }
)
</script>
