<template>
  <div class="workspace-surface workspace-surface--compact">
    <FireCopyError v-if="editor.moveError" :message="editor.moveError" />
    <FireCopyError v-if="editor.statusError" :message="editor.statusError" />
    <KitchenWorkspaceMenuMenusSectionsCollectionSchedule
      v-if="editor.menu && editor.daily"
      v-model="editor.selectedDate"
    />
    <UAlert
      v-if="!editor.menu"
      color="neutral"
      variant="soft"
      :title="editor.emptyTitle"
      :description="editor.emptyDescription"
    />

    <template v-else>
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
      <template v-else>
        <KitchenWorkspaceMenuMenusSectionsCreate
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
        <div class="menu-section-workbench">
          <div
            v-if="sections.length || !editor.daily"
            class="menu-section-workbench__sidebar"
          >
            <nav
              v-if="sections.length"
              aria-label="Menu sections"
              class="menu-section-workbench__nav"
            >
              <UButton
                v-for="section in sections"
                :key="section.id"
                type="button"
                :label="editor.displaySectionLabel(section)"
                icon="i-lucide-list"
                :color="
                  activeSection?.id === section.id ? 'primary' : 'neutral'
                "
                :variant="activeSection?.id === section.id ? 'soft' : 'ghost'"
                :aria-current="
                  activeSection?.id === section.id ? 'true' : undefined
                "
                class="menu-section-workbench__link"
                @click="openSection = section.id"
              />
            </nav>
            <UButton
              v-if="!editor.daily"
              class="menu-section-workbench__link"
              size="sm"
              color="neutral"
              variant="soft"
              :icon="
                editor.showCreateSection ? 'i-lucide-minus' : 'i-lucide-plus'
              "
              :label="editor.showCreateSection ? 'Cancel' : 'Add section'"
              :aria-expanded="editor.showCreateSection"
              :disabled="
                !editor.canWrite ||
                editor.sectionsPending ||
                Boolean(editor.sectionsError)
              "
              @click="editor.showCreateSection = !editor.showCreateSection"
            />
          </div>
          <section
            v-if="activeSection"
            :key="activeSection.id"
            :aria-label="editor.displaySectionLabel(activeSection)"
            class="menu-section-workbench__editor"
          >
            <KitchenWorkspaceMenuMenusSectionsCollectionRow
              :section="activeSection"
              :editor="editor"
            />
            <KitchenWorkspaceMenuMenusSectionsInline :section-id="activeSection.id" />
          </section>
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
      </template>
    </template>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useMenuSectionsEditor } from '../../../../../../composables/workspace/menu/menus/useMenuSectionsEditor'
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
// Return links can open a section once. Browsing sections stays local.
onMounted(() => {
  watch(
    () => route.query.section,
    (section) => {
      if (typeof section !== 'string') return
      openSection.value = section
      const query = { ...route.query }
      delete query.section
      void router.replace({ path: route.path, query, hash: route.hash })
    },
    { immediate: true }
  )
})
</script>

<style scoped>
.menu-section-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
}
.menu-section-workbench__sidebar,
.menu-section-workbench__nav {
  display: grid;
  align-content: start;
  gap: var(--spacing);
  min-width: 0;
}
.menu-section-workbench__sidebar {
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

<style src="../../../../../../../menu/assets/styles/menu-editor.css"></style>
