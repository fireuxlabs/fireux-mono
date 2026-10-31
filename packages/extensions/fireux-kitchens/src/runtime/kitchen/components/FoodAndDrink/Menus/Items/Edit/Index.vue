<template>
  <div class="menu-items-editor workspace-surface workspace-surface--compact">
    <FireCopyError v-if="editor.moveError" :message="editor.moveError" />
    <div class="menu-editor-actions">
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

    <FireCopyError
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
        <FireCollectionRow as="div" class="menu-item-heading">
          <div>
            <div class="menu-editor-actions">
              <h2 class="fx-type-card-heading">
                {{ editor.section.label }}
              </h2>
              <span
                v-if="!editor.itemsPending && !editor.itemsError"
                class="fx-type-caption"
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
            <p v-if="editor.section.date" class="fx-type-caption">
              {{ editor.section.date }}
            </p>
          </div>
          <template #value>
            <span
              v-if="editor.currencyCode"
              class="menu-item-value"
              :aria-label="`Prices in ${editor.currencyCode}`"
              >{{ editor.currencyCode }}</span
            >
            <span v-else aria-hidden="true" />
          </template>
          <template #actions
            ><span class="menu-item-action-placeholder" aria-hidden="true"
          /></template>
        </FireCollectionRow>
      </template>

      <FireCopyError
        v-if="editor.itemsError"
        :message="String(editor.itemsError)"
      />
      <p v-else-if="editor.itemsPending" role="status">Loading items…</p>
      <div v-else-if="editor.itemRows.length" class="menu-editor-list">
        <KitchenFoodAndDrinkMenusItemsEditRow
          v-for="row in editor.itemRows"
          :key="row.id"
          :row="row"
          :editor="editor"
        />
      </div>

      <p v-else class="fx-type-caption">
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
.menu-item-value {
  text-align: right;
  overflow-wrap: anywhere;
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
.menu-item-action-placeholder {
  inline-size: 2rem;
  block-size: 2rem;
}
.menu-item-heading {
  padding-block: 0;
}

.menu-items-editor {
  --collection-row-value-width: 5.5rem;
  --collection-row-actions-width: 2rem;
}
</style>

<style src="../../../../../../menu/assets/styles/menu-editor.css"></style>
