<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <NuxtLink
          :to="`/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(menu.slug)}`"
          @click="rememberView(menu.slug, 'content', $event)"
          class="font-semibold"
          >{{ menu.name }}</NuxtLink
        >
        <UBadge color="neutral" variant="soft">{{
          menu.status === 'published' ? 'Published' : 'Unpublished'
        }}</UBadge>
      </div>
    </template>
    <MoleculesCopyError v-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading sections…</p>
    <template v-else>
      <DishMenuSection
        v-for="section in sections"
        :key="section.id"
        :menu="menu"
        :section="section"
        @result="results[section.id] = $event"
      />
      <p v-if="settledEmpty" class="text-sm text-muted">Not on this menu.</p>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import { useMenuRecordNavigation } from '../../../composables/workspace/menus/useMenuRecordNavigation'
const { rememberView } = useMenuRecordNavigation()
import { computed, reactive } from 'vue'
import type { Menu } from '../../../../menu/models/menu.model'
import DishMenuSection from './MenuSection.vue'
import { useKitchenDishDetail } from '../../../composables/dish/useKitchenDishDetail'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
const props = defineProps<{ menu: Menu }>()
const { storageKitchenId, databaseId, rootCollection } = useKitchenDishDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('dishId')
)
const { sections, pending, error } = useMenuSectionCollection(
  storageKitchenId,
  computed(() => props.menu.id),
  { databaseId, kitchenCollectionPath: rootCollection }
)
const results = reactive<
  Record<string, 'pending' | 'error' | 'empty' | 'match'>
>({})
const settledEmpty = computed(
  () =>
    !pending.value &&
    !error.value &&
    sections.value.every((section) => results[section.id] === 'empty')
)
</script>
