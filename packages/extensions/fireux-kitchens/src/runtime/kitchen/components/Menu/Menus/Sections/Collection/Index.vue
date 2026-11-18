<template>
  <div class="workspace-surface workspace-surface--compact">
    <FireCopyError v-if="editor.moveError" :message="editor.moveError" />
    <FireCopyError v-if="editor.statusError" :message="editor.statusError" />
    <KitchenMenuMenusSectionsCollectionSchedule
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
          </div>
          <UButton
            v-if="!editor.daily"
            size="sm"
            color="neutral"
            variant="soft"
            :icon="
              editor.showCreateSection ? 'i-lucide-minus' : 'i-lucide-plus'
            "
            :label="editor.showCreateSection ? 'Cancel' : 'Add section'"
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
        <KitchenMenuMenusSectionsCreate
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
        <div v-if="sections.length" class="menu-section-workbench">
          <nav aria-label="Menu sections" class="menu-section-workbench__nav">
            <UButton
              v-for="section in sections"
              :key="section.id"
              type="button"
              :label="editor.displaySectionLabel(section)"
              icon="i-lucide-list"
              :color="activeSection?.id === section.id ? 'primary' : 'neutral'"
              :variant="activeSection?.id === section.id ? 'soft' : 'ghost'"
              :aria-current="
                activeSection?.id === section.id ? 'true' : undefined
              "
              class="menu-section-workbench__link"
              @click="openSection = section.id"
            />
          </nav>
          <section
            v-if="activeSection"
            :key="activeSection.id"
            :aria-label="editor.displaySectionLabel(activeSection)"
            class="menu-section-workbench__editor"
          >
            <KitchenMenuMenusSectionsCollectionRow
              :section="activeSection"
              :editor="editor"
            />
            <KitchenMenuMenusSectionsInline :section-id="activeSection.id" />
          </section>
        </div>

        <p v-else class="fx-type-caption">
          {{
            editor.showArchived
              ? 'No archived sections.'
              : editor.daily
                ? 'Nothing planned for this date.'
                : 'No sections yet. Add a section to start placing items.'
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
      :description="`Hide ${editor.archiveCandidate?.label || 'this section'} from this Menu. Its entries and Items stay saved, and you can restore it later.`"
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
import { computed, reactive, ref, watch } from 'vue'
import { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
import { useRoute, useRouter } from '#imports'
const route = useRoute()
const router = useRouter()
const openSection = ref(
  typeof route.query.section === 'string' ? route.query.section : ''
)
const editor = reactive(useMenuSectionsEditor())
const sections = computed(() =>
  editor.showArchived ? editor.archivedSections : editor.visibleSections
)
const activeSection = computed(
  () =>
    sections.value.find((section) => section.id === openSection.value) ??
    sections.value[0]
)
watch(
  () => editor.menuSlug,
  () => {
    openSection.value =
      typeof route.query.section === 'string' ? route.query.section : ''
  }
)
watch(
  () => `${editor.selectedDate}/${editor.showArchived}`,
  () => {
    openSection.value = ''
  }
)
watch(openSection, (section) => {
  if (route.query.section !== (section || undefined))
    void router.replace({
      query: { ...route.query, section: section || undefined },
    })
})
</script>

<style scoped>
.menu-section-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
}
.menu-section-workbench__nav {
  display: grid;
  align-content: start;
  gap: var(--spacing);
  min-width: 0;
  padding: calc(var(--spacing) * 2);
  background: var(--ui-bg-elevated);
  border-radius: var(--ui-radius);
}
.menu-section-workbench__link {
  justify-content: flex-start;
  text-align: start;
  white-space: normal;
  overflow-wrap: anywhere;
}
.menu-section-workbench__editor {
  display: grid;
  align-content: start;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
}
@media (min-width: 64rem) {
  .menu-section-workbench {
    grid-template-columns: minmax(10rem, 15rem) minmax(0, 1fr);
  }
}
</style>

<style src="../../../../../../menu/assets/styles/menu-editor.css"></style>
