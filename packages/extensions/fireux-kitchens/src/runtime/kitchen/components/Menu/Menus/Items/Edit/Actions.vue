<template>
  <UDropdownMenu :items="actions">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      color="neutral"
      variant="ghost"
      :aria-label="`Actions for ${row.label}`"
      :disabled="busy"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { MenuEntryRow } from '../../../../../../menu/composables/useMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
const props = defineProps<{
  itemDestination: RouteLocationRaw
  row: MenuEntryRow
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionItemsEditor>>
}>()
const busy = computed(() =>
  Boolean(props.editor.removing || props.editor.moving)
)
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
          label: 'Edit item',
          to: props.itemDestination,
        }
      : {
          label: 'Edit meal deal',
          to: '/workspace/kitchen/menu/promotions',
        },
  ],
  ...(props.editor.canWrite
    ? [
        [
          {
            label: 'Remove from this section',
            icon: 'i-lucide-list-minus',
            color: 'error' as const,
            disabled: busy.value,
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
