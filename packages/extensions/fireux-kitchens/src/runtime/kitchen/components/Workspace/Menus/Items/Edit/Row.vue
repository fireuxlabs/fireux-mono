<template>
  <article class="menu-item-row items-center gap-3 py-3">
    <div
      class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <h3 class="text-sm font-semibold text-highlighted">
        {{ row.label }}
      </h3>
      <span
        class="max-w-full text-sm text-muted whitespace-normal break-words"
        >{{ editor.formatItemPrice(row) }}</span
      >
    </div>
    <div class="flex shrink-0 items-center gap-1">
      <UDropdownMenu :items="actions">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          :aria-label="`Actions for ${row.label}`"
          :disabled="Boolean(editor.removing)"
        />
      </UDropdownMenu>
      <span v-if="row.item.status === 'archived'" class="text-xs text-muted"
        >Off menu</span
      >
      <UButton
        v-if="editor.canWrite"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        :aria-label="`Remove ${row.label} from this Menu`"
        :title="`Remove ${row.label} from this Menu`"
        :loading="editor.removing === row.id"
        :disabled="Boolean(editor.removing)"
        @click="editor.removeFromMenu(row)"
      />
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { MenuSectionItemRow } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
const props = defineProps<{
  row: MenuSectionItemRow
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionItemsEditor>>
}>()
const actions = computed(() => [
  props.row.dishId
    ? {
        label: 'Edit dish',
        to: {
          path: `/workspace/kitchen/food/dishes/${encodeURIComponent(props.row.dishId)}`,
          query: {
            menu: props.editor.menuSlug,
            section: props.editor.sectionId,
          },
        },
      }
    : { label: 'Edit meal deal', to: '/workspace/kitchen/promotions' },
])
</script>

<style scoped>
.menu-item-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
}
</style>
