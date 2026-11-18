<template>
  <FireCollectionRow>
    <MenuItemDisplay
      as="div"
      :name="row.label"
      :name-to="row.dishId ? itemDestination : undefined"
      :description="row.dish?.description"
      :image-url="row.dish?.image"
      show-item-images
      :price="priceLabel"
      class="menu-editor-item"
    >
      <span v-if="row.item.status === 'archived'" class="fx-type-caption"
        >Off menu</span
      >
    </MenuItemDisplay>
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
const itemDestination = computed(() => ({
  path: `/workspace/kitchen/menu/items/${encodeURIComponent(props.row.dishId)}`,
  query: {
    menu: props.editor.menuSlug,
    section: props.editor.sectionId,
    ...(props.editor.embedded ? { inline: '1' } : {}),
  },
}))
const priceLabel = computed(() => {
  if (props.row.price === undefined) return 'Price not set'
  if (props.row.priceOptions.length) return 'Multiple prices'
  return props.editor.formatPrice(props.row.price)
})
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
          to: itemDestination.value,
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
.menu-editor-item {
  border-bottom: 0;
}
</style>
