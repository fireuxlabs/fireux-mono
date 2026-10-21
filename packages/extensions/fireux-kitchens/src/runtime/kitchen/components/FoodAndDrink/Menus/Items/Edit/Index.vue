<template>
  <div class="menu-items-editor space-y-4">
    <MoleculesCopyError v-if="editor.moveError" :message="editor.moveError" />
    <div class="flex items-center justify-between gap-3">
      <UButton
        :to="`/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(editor.menuSlug)}`"
        @click="editor.rememberView(editor.menuSlug, 'content', $event)"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to sections
      </UButton>
      <KitchenFoodAndDrinkMenusItemsAdd v-if="editor.section" />
    </div>

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
        <CollectionRow as="div" :style="{ paddingBlock: 0 }">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold text-highlighted">
                {{ editor.section.label }}
              </h2>
              <span
                v-if="!editor.itemsPending && !editor.itemsError"
                class="text-center text-xs text-muted"
                :aria-label="`${editor.itemRows.length} items`"
                >{{ editor.itemRows.length }}</span
              >
            </div>
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
          <template #value>
            <span
              v-if="editor.currencyCode"
              class="text-right text-xs text-muted"
              :aria-label="`Prices in ${editor.currencyCode}`"
              >{{ editor.currencyCode }}</span
            >
            <span v-else aria-hidden="true" />
          </template>
          <template #actions
            ><span class="size-8" aria-hidden="true"
          /></template>
        </CollectionRow>
      </template>

      <MoleculesCopyError
        v-if="editor.itemsError"
        :message="String(editor.itemsError)"
      />
      <p v-else-if="editor.itemsPending" role="status">Loading items…</p>
      <div v-else-if="editor.itemRows.length" class="divide-y divide-default">
        <KitchenFoodAndDrinkMenusItemsEditRow
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

<style scoped>
.menu-items-editor {
  --collection-row-value-width: 5.5rem;
  --collection-row-actions-width: 2rem;
}
</style>
