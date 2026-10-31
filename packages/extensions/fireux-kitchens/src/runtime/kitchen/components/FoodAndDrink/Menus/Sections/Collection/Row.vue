<template>
  <FireCollectionRow>
    <div class="workspace-surface__primary">
      <FireFormsEditableSimpleField
        class="menu-section-name-field"
        :label="editor.displaySectionLabel(section)"
        :value="section.label"
        placeholder="Section name"
        :maxlength="160"
        :disabled="
          section.status === 'archived' ||
          !editor.canWrite ||
          editor.sectionsPending ||
          Boolean(editor.sectionsError)
        "
        disabled-message="This menu is read-only."
        :validation-function="editor.validateSectionLabel"
        :update="(value) => editor.saveSectionLabel(section.id, value)"
      />
      <p v-if="section.description" class="fx-type-caption">
        {{ section.description }}
      </p>
      <KitchenFoodAndDrinkMenusSectionsDishes
        v-if="editor.daily"
        :section-id="section.id"
        :dishes="editor.previewDishes.dishes"
        :dishes-pending="editor.previewDishes.pending"
        :dishes-error="editor.previewDishes.error"
      />
    </div>
    <template #actions>
      <UButton
        size="sm"
        variant="ghost"
        :to="`/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(editor.menuSlug)}/${encodeURIComponent(section.id)}`"
        >Items</UButton
      >
      <UDropdownMenu :items="actions">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          :aria-label="`Actions for ${editor.displaySectionLabel(section)}`"
          :disabled="Boolean(editor.moving || editor.changingStatus)"
        />
      </UDropdownMenu>
    </template>
  </FireCollectionRow>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
import type { MenuSection } from '../../../../../../menu/utils/menu-section'
const props = defineProps<{
  section: MenuSection
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionsEditor>>
}>()
const actions = computed(() =>
  props.section.status === 'archived'
    ? [
        {
          label: 'Restore section',
          icon: 'i-lucide-archive-restore',
          disabled: !props.editor.canWrite,
          onSelect: () =>
            props.editor.setSectionStatus(props.section.id, 'active'),
        },
      ]
    : [
        {
          label: 'Move up',
          icon: 'i-lucide-arrow-up',
          disabled: !props.editor.canMove(props.section.id, 'up'),
          onSelect: () => props.editor.move(props.section.id, 'up'),
        },
        {
          label: 'Move down',
          icon: 'i-lucide-arrow-down',
          disabled: !props.editor.canMove(props.section.id, 'down'),
          onSelect: () => props.editor.move(props.section.id, 'down'),
        },
        {
          label: 'Archive section',
          icon: 'i-lucide-archive',
          disabled: !props.editor.canWrite,
          onSelect: () => props.editor.requestArchive(props.section),
        },
      ]
)
</script>
<style scoped>
.menu-section-name-field :deep(.fx-field-surface) {
  display: none;
}
</style>
