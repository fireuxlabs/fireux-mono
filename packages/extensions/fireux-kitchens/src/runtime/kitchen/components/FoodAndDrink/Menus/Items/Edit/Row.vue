<template>
  <FireCollectionRow>
    <div class="workspace-surface__primary">
      <h3 class="fx-type-card-heading">{{ row.label }}</h3>
      <span v-if="row.item.status === 'archived'" class="fx-type-caption"
        >Off menu</span
      >
    </div>
    <template #value>
      <span class="menu-item-value">{{
        row.price === undefined
          ? 'Price not set'
          : row.priceOptions.length
            ? 'Multiple prices'
            : editor.formatPrice(row.price)
      }}</span>
    </template>
    <template #actions>
      <UDropdownMenu :items="actions">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          :aria-label="`Actions for ${row.label}`"
          :disabled="Boolean(editor.removing || editor.moving)"
        />
      </UDropdownMenu>
    </template>
  </FireCollectionRow>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { MenuSectionItemRow } from '../../../../../../menu/composables/useMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
const props = defineProps<{
  row: MenuSectionItemRow
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionItemsEditor>>
}>()
const actions = computed(() => [
  [
    ...(props.editor.canWrite
      ? [
          {
            label: 'Move up',
            icon: 'i-lucide-arrow-up',
            disabled: !props.editor.canMove(props.row, 'up'),
            onSelect: () => props.editor.move(props.row, 'up'),
          },
          {
            label: 'Move down',
            icon: 'i-lucide-arrow-down',
            disabled: !props.editor.canMove(props.row, 'down'),
            onSelect: () => props.editor.move(props.row, 'down'),
          },
        ]
      : []),
    props.row.dishId
      ? {
          label: 'Edit dish',
          to: {
            path: `/workspace/kitchen/food-and-drink/items/${encodeURIComponent(props.row.dishId)}`,
            query: {
              menu: props.editor.menuSlug,
              section: props.editor.sectionId,
            },
          },
        }
      : {
          label: 'Edit meal deal',
          to: '/workspace/kitchen/food-and-drink/promotions',
        },
  ],
  ...(props.editor.canWrite
    ? [
        [
          {
            label: 'Remove from section',
            icon: 'i-lucide-list-minus',
            color: 'error' as const,
            disabled: Boolean(props.editor.removing || props.editor.moving),
            onSelect: () => props.editor.removeFromMenu(props.row),
          },
        ],
      ]
    : []),
  ...(props.row.priceOptions.length
    ? [
        [
          { label: 'Variants', type: 'label' as const },
          ...props.row.priceOptions.map((option) => ({
            label: `${option.label || [option.quantity, option.unit].filter(Boolean).join(' ')} · ${props.editor.formatPrice(option.price)}`,
            type: 'label' as const,
          })),
        ],
      ]
    : []),
])
</script>

<style scoped>
.menu-item-value {
  text-align: right;
  overflow-wrap: anywhere;
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
</style>
