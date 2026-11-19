<template>
  <FireCollectionRow>
    <MenuItemDisplay
      as="div"
      :name="row.label"
      :name-to="row.dishId ? itemDestination : undefined"
      :description="row.dish?.description"
      :image-url="showItemImages ? row.dish?.image : undefined"
      :price="itemPrice"
      :announce-price="Boolean(choiceGroups.length)"
      class="menu-editor-item"
    >
      <span v-if="row.entry.status === 'archived'" class="fx-type-caption"
        >Off menu</span
      >
      <MenuItemChoices
        v-if="choiceGroups.length"
        v-model="selections"
        :groups="choiceGroups"
        :money="editor.formatPrice"
        :show-names="row.dish?.choice_groups !== undefined"
      />
    </MenuItemDisplay>
    <template #actions>
      <KitchenWorkspaceMenuMenusItemsEditActions
        :row="row"
        :editor="editor"
        :item-destination="itemDestination"
      />
    </template>
  </FireCollectionRow>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import { useMenuItemChoicePreview } from '../../../../../../../menu/composables/useMenuItemChoicePreview'
import type { MenuEntryRow } from '../../../../../../../menu/composables/useMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../../composables/workspace/menu/menus/useMenuSectionItemsEditor'
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
const { choiceGroups, selections, itemPrice } = useMenuItemChoicePreview(
  () => ({
    id: props.row.id,
    dishId: props.row.dishId,
    price: props.row.price,
    choice_groups: props.row.dish?.choice_groups,
    priceOptions: props.row.priceOptions,
    addOns: props.row.addOns,
  }),
  (price) => props.editor.formatPrice(price),
  'Price not set'
)
</script>

<style scoped>
.menu-editor-item {
  border-bottom: 0;
}
</style>
