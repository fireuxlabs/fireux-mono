<template>
  <article class="flex flex-wrap items-center justify-between gap-3 py-3">
    <div class="min-w-0 flex-1">
      <MoleculesFormsEditableSimpleField
        class="menu-section-name-field"
        :label="editor.displaySectionLabel(section)"
        :value="section.label"
        placeholder="Section name"
        :maxlength="160"
        :disabled="
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
      <WorkspaceKitchenMenusSectionsDishes
        v-if="editor.daily"
        :section-id="section.id"
      />
    </div>
    <div class="flex shrink-0 items-center gap-1">
      <UButton
        size="sm"
        variant="ghost"
        :to="`/workspace/kitchen/menus/${encodeURIComponent(editor.menuSlug)}/${encodeURIComponent(section.id)}`"
        >Items</UButton
      >
      <UDropdownMenu :items="actions">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          :aria-label="`Actions for ${editor.displaySectionLabel(section)}`"
          :disabled="Boolean(editor.moving)"
        />
      </UDropdownMenu>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed, type UnwrapNestedRefs } from 'vue'
import type { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
import type { MenuSection } from '../../../../../../menu/utils/menu-section'
const props = defineProps<{
  section: MenuSection
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionsEditor>>
}>()
const actions = computed(() => [
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
])
</script>
<style scoped>
.menu-section-name-field :deep(.fx-field-surface) {
  display: none;
}
</style>
