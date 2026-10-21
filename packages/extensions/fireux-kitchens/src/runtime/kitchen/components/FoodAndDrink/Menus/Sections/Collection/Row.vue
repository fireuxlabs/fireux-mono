<template>
  <CollectionRow>
    <div class="min-w-0 flex-1">
      <MoleculesFormsEditableSimpleField
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
      <p v-if="section.description" class="text-sm text-dimmed">
        {{ section.description }}
      </p>
      <KitchenFoodAndDrinkMenusSectionsDishes
        v-if="editor.daily"
        :section-id="section.id"
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
  </CollectionRow>
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
