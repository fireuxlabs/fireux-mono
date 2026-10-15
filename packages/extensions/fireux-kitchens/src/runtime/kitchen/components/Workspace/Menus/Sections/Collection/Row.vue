<template>
  <article
    class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default bg-default p-3"
  >
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
    <UButton
      size="sm"
      variant="soft"
      icon="i-lucide-utensils"
      :to="`/workspace/kitchen/menus/${encodeURIComponent(editor.menuSlug)}/${encodeURIComponent(section.id)}`"
    >
      Items
    </UButton>
  </article>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
import type { MenuSection } from '../../../../../../menu/utils/menu-section'
defineProps<{
  section: MenuSection
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionsEditor>>
}>()
</script>
<style scoped>
.menu-section-name-field :deep(.fx-field-surface) {
  display: none;
}
</style>
