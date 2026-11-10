<template>
  <div class="workspace-surface workspace-surface--compact">
    <FireCopyError v-if="editor.moveError" :message="editor.moveError" />
    <FireCopyError v-if="editor.statusError" :message="editor.statusError" />
    <KitchenFoodAndDrinkMenusSectionsCollectionSchedule
      v-if="editor.menu"
      v-model="editor.selectedDate"
    />
    <UAlert
      v-if="!editor.menu"
      color="neutral"
      variant="soft"
      :title="editor.emptyTitle"
      :description="editor.emptyDescription"
    />

    <UCard v-else>
      <template #header>
        <div class="menu-editor-actions">
          <div>
            <h2 class="fx-type-card-heading">
              {{ editor.daily ? editor.formattedDate : 'Menu sections' }}
            </h2>
            <p
              v-if="editor.menu.description && !editor.daily"
              class="fx-type-caption"
            >
              {{ editor.menu.description }}
            </p>
          </div>
          <UButton
            v-if="!editor.daily"
            size="sm"
            color="neutral"
            variant="soft"
            :icon="
              editor.showCreateSection ? 'i-lucide-minus' : 'i-lucide-plus'
            "
            :aria-label="
              editor.showCreateSection ? 'Hide section fields' : 'Add section'
            "
            :disabled="
              !editor.canWrite ||
              editor.sectionsPending ||
              Boolean(editor.sectionsError)
            "
            @click="editor.showCreateSection = !editor.showCreateSection"
          />
        </div>
      </template>

      <FireCopyError
        v-if="editor.sectionsError"
        :message="String(editor.sectionsError)"
      />
      <p
        v-else-if="editor.sectionsPending"
        role="status"
        class="fx-type-caption"
      >
        Loading sections…
      </p>
      <div v-else class="workspace-surface workspace-surface--compact">
        <KitchenFoodAndDrinkMenusSectionsCreate
          v-if="editor.showCreateSection"
          :editor="editor"
        />

        <UButton
          v-if="editor.archivedSections.length || editor.showArchived"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-pressed="editor.showArchived"
          @click="editor.showArchived = !editor.showArchived"
        >
          {{
            editor.showArchived
              ? 'Active sections'
              : `Archived sections (${editor.archivedSections.length})`
          }}
        </UButton>
        <div
          v-if="
            (editor.showArchived
              ? editor.archivedSections
              : editor.visibleSections
            ).length
          "
          class="menu-editor-list"
        >
          <KitchenFoodAndDrinkMenusSectionsCollectionRow
            v-for="section in editor.showArchived
              ? editor.archivedSections
              : editor.visibleSections"
            :key="section.id"
            :section="section"
            :editor="editor"
          />
        </div>

        <p v-else class="fx-type-caption">
          {{
            editor.showArchived
              ? 'No archived sections.'
              : editor.daily
                ? 'Nothing planned for this date.'
                : 'No sections yet.'
          }}
        </p>
      </div>
    </UCard>
    <UModal
      :open="Boolean(editor.archiveCandidate)"
      @update:open="
        (open) => {
          if (!open && !editor.changingStatus) editor.archiveCandidate = null
        }
      "
      title="Archive section?"
      :description="`Hide ${editor.archiveCandidate?.label || 'this section'} from this Menu. Its entries and Dishes stay saved, and you can restore it later.`"
    >
      <template #body>
        <FireCopyError
          v-if="editor.statusError"
          :message="editor.statusError"
          class="workspace-surface workspace-surface--compact"
        />
        <div class="menu-editor-actions">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="Boolean(editor.changingStatus)"
            @click="editor.archiveCandidate = null"
            >Cancel</UButton
          >
          <UButton
            color="warning"
            :loading="Boolean(editor.changingStatus)"
            @click="
              editor.archiveCandidate &&
              editor.setSectionStatus(editor.archiveCandidate.id, 'archived')
            "
            >Archive section</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
const editor = reactive(useMenuSectionsEditor())
</script>

<style src="../../../../../../menu/assets/styles/menu-editor.css"></style>
