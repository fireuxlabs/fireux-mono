<template>
  <div class="space-y-4">
    <WorkspaceKitchenMenusSectionsCollectionSchedule
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
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              {{ editor.daily ? editor.formattedDate : 'Menu sections' }}
            </h2>
            <p class="text-sm text-dimmed">
              {{
                editor.menu.description ||
                'Build the menu from sections and dish-backed items.'
              }}
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

      <MoleculesCopyError
        v-if="editor.sectionsError"
        :message="String(editor.sectionsError)"
      />
      <p
        v-else-if="editor.sectionsPending"
        role="status"
        class="text-sm text-muted"
      >
        Loading sections…
      </p>
      <div v-else class="space-y-4">
        <WorkspaceKitchenMenusSectionsCreate
          v-if="editor.showCreateSection"
          :editor="editor"
        />

        <div v-if="editor.visibleSections.length" class="space-y-3">
          <WorkspaceKitchenMenusSectionsCollectionRow
            v-for="section in editor.visibleSections"
            :key="section.id"
            :section="section"
            :editor="editor"
          />
        </div>

        <p v-else class="text-sm text-dimmed">
          {{
            editor.daily ? 'Nothing planned for this date.' : 'No sections yet.'
          }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
const editor = reactive(useMenuSectionsEditor())
</script>
