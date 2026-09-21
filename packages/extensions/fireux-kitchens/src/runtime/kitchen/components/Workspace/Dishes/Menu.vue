<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <NuxtLink
          :to="`/workspace/kitchen/menus/${menu.slug}/content`"
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
import { computed, reactive } from 'vue'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import DishMenuSection from './MenuSection.vue'
import { useKitchenWorkspaceDish } from '../../../composables/workspace/dishes/useKitchenWorkspaceDish'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
const props = defineProps<{ menu: KitchenMenu }>()
const { kitchenId, databaseId, rootCollection } = useKitchenWorkspaceDish()
const { sections, pending, error } = useMenuSectionCollection(
  kitchenId,
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
