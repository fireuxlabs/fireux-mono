<template>
  <article
    class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-default bg-default p-3"
  >
    <div class="min-w-0 flex-1">
      <h3 class="text-sm font-semibold text-highlighted">
        {{ row.label }}
      </h3>
      <p v-if="row.dish?.description" class="text-sm text-dimmed">
        {{ row.dish.description }}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <UBadge color="neutral" variant="soft">{{
        editor.formatItemPrice(row)
      }}</UBadge>
      <UButton
        v-if="row.dishId"
        size="sm"
        color="neutral"
        variant="soft"
        icon="i-lucide-pencil"
        :to="{
          path: `/workspace/kitchen/food/dishes/${encodeURIComponent(row.dishId)}`,
          query: { menu: editor.menuSlug, section: editor.sectionId },
        }"
      >
        Full dish
      </UButton>
      <UButton
        v-else
        to="/workspace/kitchen/promotions"
        size="sm"
        color="neutral"
        variant="soft"
        >Edit meal deal</UButton
      >
      <USwitch
        :model-value="row.item.status !== 'archived'"
        :label="row.item.status === 'archived' ? 'Off menu' : 'On menu'"
        :disabled="!editor.canWrite || editor.savingAvailability === row.id"
        @update:model-value="editor.setAvailability(row, $event)"
      />
    </div>
  </article>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { MenuSectionItemRow } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
defineProps<{
  row: MenuSectionItemRow
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionItemsEditor>>
}>()
</script>
