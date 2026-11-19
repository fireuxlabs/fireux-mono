<template>
  <FireCollectionRow>
    <MenuItemDisplay
      as="div"
      :name="row.label"
      :name-to="row.dishId ? itemDestination : undefined"
      :description="row.dish?.description"
      :image-url="showItemImages ? row.dish?.image : undefined"
      :price="priceLabel"
      class="menu-editor-item"
    >
      <span v-if="row.entry.status === 'archived'" class="fx-type-caption"
        >Off menu</span
      >
    </MenuItemDisplay>
    <template #actions>
      <KitchenMenuMenusItemsEditActions
        :row="row"
        :editor="editor"
        :item-destination="itemDestination"
      />
    </template>
  </FireCollectionRow>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { MenuEntryRow } from '../../../../../../menu/composables/useMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
const props = defineProps<{
  showItemImages: boolean
  row: MenuEntryRow
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
</script>

<style scoped>
.menu-editor-item {
  border-bottom: 0;
}
</style>
