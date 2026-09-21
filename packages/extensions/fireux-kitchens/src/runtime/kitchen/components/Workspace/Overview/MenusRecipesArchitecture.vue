<template>
  <MoleculesDisclosurePanel title="Page architecture" icon="i-lucide-code">
    <div class="flex flex-col gap-5">
      <p class="text-sm text-muted">
        For development: what each page does, where its data comes from, and
        what is missing. These notes do not verify access or release readiness.
      </p>
      <section
        v-for="entry in entries"
        :key="entry.key"
        class="space-y-2 border-t border-default pt-4"
      >
        <h3 class="font-semibold">{{ entry.label }}</h3>
        <dl class="space-y-3 text-sm">
          <template
            v-for="(value, label) in notes[entry.key || '']?.explanation"
            :key="label"
          >
            <div>
              <dt class="font-medium">{{ label }}</dt>
              <dd class="mt-1 break-words text-muted">{{ value }}</dd>
            </div>
          </template>
        </dl>
        <details class="text-xs text-muted">
          <summary class="cursor-pointer py-2">Source references</summary>
          <dl class="space-y-2 rounded-lg bg-elevated p-3">
            <div>
              <dt class="font-medium">Routes</dt>
              <dd class="mt-1 break-all font-mono">
                {{ entry.to }}
                <template v-if="entry.key === 'workspace-kitchen-dishes'">
                  · {{ drinksRoute }}
                </template>
              </dd>
            </div>
            <div
              v-for="(value, label) in notes[entry.key || '']?.references"
              :key="label"
            >
              <dt class="font-medium">{{ label }}</dt>
              <dd class="mt-1 break-words font-mono">{{ value }}</dd>
            </div>
          </dl>
        </details>
      </section>
    </div>
  </MoleculesDisclosurePanel>
</template>
<script setup lang="ts">
import type { NavItem } from 'fireux-core/runtime/composables/navigation/types'
defineProps<{ entries: NavItem[]; drinksRoute?: string }>()
// Only facts missing from navigation metadata belong here. No destination catalogue.
const notes: Record<
  string,
  {
    explanation: Record<string, string>
    references: Record<string, string>
  }
> = {
  'workspace-kitchen-menus': {
    explanation: {
      'What this page manages': 'The selected Kitchen’s menus.',
      'How you open an item':
        'Browse Menus opens the list. Select a menu name to open it; a daily menu opens its calendar.',
      'What you can do':
        'Create or import a menu, edit its content and publish it. Publishing a menu and enabling orders are separate steps.',
    },
    references: {
      Component: 'Workspace/Menus/Index.vue',
      Reader: 'useKitchenMenuCollection — live menus for the selected Kitchen.',
      Ownership:
        'Kitchen composes the workspace; Menu owns menu records and publication.',
    },
  },
  'workspace-kitchen-dishes': {
    explanation: {
      'What this page manages':
        'The selected Kitchen’s food and drinks. Both use the same stored dish records, classified as food or drink.',
      'How you open an item':
        'Browse Food and Browse Drinks open separate lists. Select an item to open its specification.',
      'What you can do':
        'Browse, filter, create items and open their specifications.',
      'Not connected yet':
        'Summaries showing which menus use an item and its pricing are not connected.',
    },
    references: {
      Component: 'Workspace/Dishes/Index.vue — food or drink context.',
      Reader:
        'useKitchenDishCollection — live dishes for the selected Kitchen.',
      Classification: 'item_kind separates food and drink records.',
    },
  },
  'workspace-kitchen-recipes': {
    explanation: {
      'What this page manages': 'The selected Kitchen’s recipes.',
      'How you open an item':
        'Browse Recipes opens the list. Select a card to preview it, then choose Open recipe for the full record.',
      'What you can do': 'Browse, preview, create and edit recipes.',
      'Not connected yet':
        'The page does not yet show which dishes use a recipe.',
    },
    references: {
      Component: 'Workspace/Recipes/Index.vue',
      Reader:
        'useKitchenRecipeCollection — live recipes for the selected Kitchen.',
      Usage: 'useKitchenWorkspaceRecipes — dish usage is not connected.',
    },
  },
  'workspace-kitchen-ingredients': {
    explanation: {
      'What this page manages':
        'The selected Kitchen’s links to the shared ingredient catalogue. Names, images and other catalogue details stay on the shared ingredient.',
      'How you open an item':
        'Browse Ingredients opens the list. Select a card to preview it, then choose Open Ingredient for its record. Previous and Next move between previews.',
      'What you can do':
        'Create links an existing catalogue ingredient to the Kitchen. Open its record to remove an unused link; the shared ingredient stays unchanged.',
      Limits:
        'The Kitchen link has no editable fields, so there is no meaningful Update action. Shared catalogue editing is separate.',
      'Removal checks':
        'Recipes, dishes, prep items and supplier links must stop using the ingredient before it can be removed.',
    },
    references: {
      Component: 'Workspace/Ingredients/Index.vue',
      Reader:
        'useKitchenIngredients — live Kitchen links combined with shared Ingredient records.',
      Model:
        'kitchen/models/ingredient.model.ts — ingredient_id and audit stamps.',
      Tools:
        'Create Ingredient and Delete Ingredient are registered. Update has no supported fields.',
    },
  },
}
</script>
