<template>
  <div class="space-y-4">
    <UButton
      :to="`/workspace/kitchen/menus/${encodeURIComponent(editor.menuSlug)}`"
      @click="editor.rememberView(editor.menuSlug, 'content', $event)"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to sections
    </UButton>

    <MoleculesCopyError
      v-if="editor.sectionsError"
      :message="String(editor.sectionsError)"
    />
    <p v-else-if="editor.sectionsPending" role="status">Loading section…</p>
    <UAlert
      v-else-if="!editor.section"
      color="neutral"
      variant="soft"
      :title="editor.pending ? 'Loading section' : 'Section not found'"
      description="Choose an existing menu section."
    />

    <UCard v-else>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              {{ editor.section.label }}
            </h2>
            <UBadge
              v-if="editor.section.status === 'archived'"
              color="neutral"
              variant="soft"
              >Archived section</UBadge
            >
            <p v-if="editor.section.date" class="mt-1 text-sm text-muted">
              {{ editor.section.date }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="editor.currencyCode"
              class="text-xs text-muted"
              :aria-label="`Prices in ${editor.currencyCode}`"
              >{{ editor.currencyCode }}</span
            >
            <WorkspaceKitchenMenusItemsAdd />
            <UBadge
              v-if="!editor.itemsPending && !editor.itemsError"
              color="neutral"
              variant="soft"
              >{{ editor.itemRows.length }}</UBadge
            >
          </div>
        </div>
      </template>

      <MoleculesCopyError
        v-if="editor.itemsError"
        :message="String(editor.itemsError)"
      />
      <p v-else-if="editor.itemsPending" role="status">Loading items…</p>
      <div v-else-if="editor.itemRows.length" class="divide-y divide-default">
        <WorkspaceKitchenMenusItemsEditRow
          v-for="row in editor.itemRows"
          :key="row.id"
          :row="row"
          :editor="editor"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No entries have been added to this section yet.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
const editor = reactive(useMenuSectionItemsEditor())
</script>
