<template>
  <div class="recipes-page">
    <div class="container mx-auto px-4 py-8">
      <div class="recipes-header">
        <h1 class="text-3xl font-bold mb-2">Recipes</h1>
        <p class="text-gray-600 mb-6">
          Browse and discover delicious recipes from professional chefs around
          the world.
        </p>

        <!-- Search and Filters -->
        <div class="recipes-controls mb-8">
          <div class="search-section">
            <UInput
              v-model="searchQuery"
              placeholder="Search recipes by name, cuisine, or ingredients..."
              icon="i-lucide-search"
              size="lg"
              class="w-full max-w-md"
            />
          </div>

          <div class="filter-section">
            <UButton
              @click="showFilters = !showFilters"
              variant="outline"
              icon="i-lucide-filter"
            >
              Filters
            </UButton>

            <UButton
              @click="showCreateForm = true"
              color="primary"
              icon="i-lucide-plus"
            >
              Add Recipe
            </UButton>
          </div>
        </div>

        <!-- Filter Panel -->
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-grid">
            <USelect
              v-model="filters.difficulty"
              placeholder="Difficulty Level"
              :options="difficultyOptions"
            />
            <USelect
              v-model="filters.maxTime"
              placeholder="Max Cook Time"
              :options="timeOptions"
            />
            <UInput
              v-model="filters.cuisine"
              placeholder="Cuisine type..."
              icon="i-lucide-globe"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        <p class="text-gray-500 mt-2">Loading recipes...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <UIcon name="i-lucide-alert-circle" class="text-red-500 text-2xl" />
        <p class="text-red-600 mt-2">
          Error loading recipes: {{ error.message }}
        </p>
      </div>

      <!-- Recipe Grid -->
      <div v-else-if="displayedRecipes.length" class="recipe-grid">
        <div
          v-for="recipe in displayedRecipes"
          :key="recipe.slug"
          @click="navigateToRecipe(recipe)"
          class="recipe-item"
        >
          <MiseObjectsRecipeCardsPill :recipe="recipe" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <UIcon name="i-lucide-chef-hat" class="text-gray-400 text-4xl" />
        <h3 class="text-lg font-semibold text-gray-900 mt-4">
          No recipes found
        </h3>
        <p class="text-gray-500 mt-2">
          {{
            searchQuery
              ? 'Try adjusting your search terms'
              : 'Be the first to add a recipe!'
          }}
        </p>
        <UButton
          @click="showCreateForm = true"
          color="primary"
          class="mt-4"
          icon="i-lucide-plus"
        >
          Add First Recipe
        </UButton>
      </div>
    </div>

    <!-- Create Recipe Modal (placeholder) -->
    <UModal v-model="showCreateForm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Add New Recipe</h3>
        <p class="text-gray-600">Recipe creation form coming soon...</p>
        <div class="flex justify-end mt-6">
          <UButton @click="showCreateForm = false" variant="outline">
            Close
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Data and state
const searchQuery = ref('')
const showFilters = ref(false)
const showCreateForm = ref(false)
const filters = ref({
  difficulty: '',
  maxTime: '',
  cuisine: '',
})

// Temporary stub - replace with proper recipe composable later
const allAvailableRecipes = ref([])
const loading = ref(false)
const error = ref(null)
const searchRecipes = (query: string) => []
const filterRecipes = (filters: any) => []

// Filter options
const difficultyOptions = [
  { label: 'All Levels', value: '' },
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
  { label: 'Professional', value: 'Professional' },
]

const timeOptions = [
  { label: 'Any time', value: '' },
  { label: 'Under 30 min', value: 30 },
  { label: 'Under 1 hour', value: 60 },
  { label: 'Under 2 hours', value: 120 },
]

// Computed filtered recipes
const displayedRecipes = computed(() => {
  let recipes = allAvailableRecipes.value

  // Apply search
  if (searchQuery.value.trim()) {
    recipes = searchRecipes(searchQuery.value)
  }

  // Apply filters
  const activeFilters = {
    ...(filters.value.difficulty && { difficulty: filters.value.difficulty }),
    ...(filters.value.maxTime && { maxTime: Number(filters.value.maxTime) }),
    ...(filters.value.cuisine && { cuisine: [filters.value.cuisine] }),
  }

  if (Object.keys(activeFilters).length > 0) {
    recipes = filterRecipes(activeFilters)
  }

  return recipes
})

// Navigation
const navigateToRecipe = (recipe: any) => {
  // navigateTo(`/recipes/${recipe.slug}`) // Disabled for now
  console.log('Navigate to recipe:', recipe)
}
</script>

<style scoped>
.recipes-header {
  margin-bottom: 2rem;
}

.recipes-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-section {
  display: flex;
  justify-content: center;
}

.filter-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.filter-panel {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.recipe-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.recipe-item:hover {
  transform: translateY(-2px);
}

@media (min-width: 640px) {
  .recipes-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .search-section {
    justify-content: flex-start;
  }

  .filter-section {
    justify-content: flex-end;
  }
}

@media (min-width: 768px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

@media (min-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  }
}
</style>
