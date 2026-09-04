<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-recipes">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Recipes">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo capability="recipes"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools capability="recipes" />
          <WorkspaceKitchenCapabilityAI
            capability="recipes"
            :suggestions="recipeSuggestions"
            :action-targets="recipeActionTargets"
          />
          <WorkspaceKitchenCapabilityView capability="recipes" />
          <WorkspaceKitchenRecipes />
          <WorkspaceKitchenCapabilityGuidingLiterature capability="recipes" />
          <WorkspaceKitchenResearchSegue
            capability="Recipes"
            base-path="/workspace/kitchen/recipes/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildMissingRecipeDescriptionSuggestions } from '../../../../kitchen/models/capability-suggestions'
import { provideKitchenRecipesWorkspace } from '../../../../kitchen/composables/workspace/Recipes/useKitchenRecipesWorkspace'

const recipesWorkspace = provideKitchenRecipesWorkspace()
const recipeSuggestions = computed(() =>
  buildMissingRecipeDescriptionSuggestions(recipesWorkspace.recipes.value)
)
const recipeActionTargets = computed(() =>
  recipesWorkspace.recipes.value.flatMap((recipe) =>
    ['kitchen.recipes.update-recipe', 'kitchen.recipes.delete-recipe'].map(
      (actionId) => ({
        actionId,
        targetId: recipe.id,
        label: String(recipe.name || 'Untitled Recipe').trim(),
      })
    )
  )
)

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-recipes',
    label: 'Recipes',
    group: 'Food & Drink',
    icon: 'i-lucide-notebook-tabs',
    position: 'top',
    order: 13,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
