<template>
  <FireDisclosurePanel title="Page architecture" icon="i-lucide-code">
    <div class="workspace-surface">
      <p>
        For development: what each page does, where its data comes from, and
        what is missing. These notes do not verify access or release readiness.
      </p>
      <section v-for="entry in entries" :key="entry.key">
        <h3>{{ entry.label }}</h3>
        <dl class="workspace-surface workspace-surface--compact">
          <template
            v-for="(value, label) in notes[entry.key || '']?.explanation"
            :key="label"
          >
            <div>
              <dt>{{ label }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </template>
        </dl>
        <details>
          <summary>Source references</summary>
          <dl>
            <div>
              <dt>Routes</dt>
              <dd>
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
              <dt>{{ label }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </details>
      </section>
    </div>
  </FireDisclosurePanel>
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
        'Create or import a menu, edit its content and publish it. Publishing a menu and enabling orders are separate steps. Menu deletion has no connected supported flow.',
    },
    references: {
      Component: 'FoodAndDrink/Menus/Index.vue',
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
      Component: 'FoodAndDrink/Items/Index.vue — food or drink context.',
      Reader:
        'useKitchenDishCollection — live dishes for the selected Kitchen.',
      Classification: 'item_kind separates food and drink records.',
    },
  },
  'workspace-kitchen-recipes': {
    explanation: {
      'What this page manages': 'The selected Kitchen’s recipes.',
      'How you open an item':
        'Browse Recipes opens the list. Select a row to open the recipe record.',
      'What you can do':
        'Browse, create and edit recipes. Create opens the same form used by the recipe collection.',
      'Not connected yet':
        'The page does not yet show which dishes use a recipe.',
    },
    references: {
      Component: 'PrepAndProduction/Recipes/Index.vue',
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
        'Browse Ingredients opens the list. Select an item to open its ingredient record.',
      'What you can do':
        'Create links an existing catalogue ingredient to the Kitchen. Open its record to remove an unused link; the shared ingredient stays unchanged.',
      Limits:
        'The Kitchen link has no editable fields, so there is no meaningful Update action. Shared catalogue editing is separate.',
      'Removal checks':
        'Removal checks current recipes, dishes, prep items and supplier links. Later reference creation does not yet enforce Kitchen ingredient-link existence.',
    },
    references: {
      Component: 'PrepAndProduction/Ingredients/Index.vue',
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
