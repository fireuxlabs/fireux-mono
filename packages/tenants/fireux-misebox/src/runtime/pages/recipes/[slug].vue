<template>
  <div class="recipe-detail-page">
    <div v-if="loading" class="container mx-auto px-4 py-8 text-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl" />
      <p class="text-gray-500 mt-2">Loading recipe...</p>
    </div>

    <div v-else-if="error" class="container mx-auto px-4 py-8 text-center">
      <UIcon name="i-lucide-alert-circle" class="text-red-500 text-3xl" />
      <p class="text-red-600 mt-2">Recipe not found</p>
      <UButton @click="$router.back()" class="mt-4">Go Back</UButton>
    </div>

    <div v-else-if="recipe" class="recipe-detail">
      <!-- Hero Section -->
      <div class="recipe-hero">
        <div class="container mx-auto px-4 py-8">
          <div class="recipe-hero-content">
            <div class="recipe-hero-image">
              <img
                v-if="recipe.featured_image"
                :src="recipe.featured_image"
                :alt="recipe.title"
                class="hero-image"
              />
              <div v-else class="hero-placeholder">
                <UIcon name="i-lucide-chef-hat" class="placeholder-icon" />
              </div>
            </div>

            <div class="recipe-hero-info">
              <div class="recipe-breadcrumb">
                <UButton
                  @click="$router.back()"
                  variant="ghost"
                  icon="i-lucide-arrow-left"
                  size="sm"
                >
                  Back to Recipes
                </UButton>
              </div>

              <h1 class="recipe-title">{{ recipe.title }}</h1>

              <p v-if="recipe.chef_name" class="recipe-chef">
                by <span class="chef-name">{{ recipe.chef_name }}</span>
              </p>

              <p v-if="recipe.description" class="recipe-description">
                {{ recipe.description }}
              </p>

              <div class="recipe-meta-bar">
                <div class="meta-item">
                  <UIcon name="i-lucide-clock" />
                  <span>{{ recipe.total_time_minutes }} min</span>
                </div>
                <div class="meta-item">
                  <UIcon name="i-lucide-trending-up" />
                  <span>{{ recipe.difficulty_level }}</span>
                </div>
                <div class="meta-item">
                  <UIcon name="i-lucide-users" />
                  <span>{{ recipe.servings }} servings</span>
                </div>
              </div>

              <div class="recipe-actions">
                <UButton color="primary" icon="i-lucide-heart">
                  Save Recipe
                </UButton>
                <UButton variant="outline" icon="i-lucide-share-2">
                  Share
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipe Content -->
      <div class="recipe-content">
        <div class="container mx-auto px-4 py-8">
          <div class="recipe-grid">
            <!-- Ingredients -->
            <div class="ingredients-section">
              <h2 class="section-title">Ingredients</h2>
              <div class="ingredients-list">
                <div
                  v-for="ingredient in recipe.ingredients"
                  :key="ingredient.name"
                  class="ingredient-item"
                >
                  <span class="ingredient-amount">
                    {{ ingredient.amount }} {{ ingredient.unit }}
                  </span>
                  <span class="ingredient-name">{{ ingredient.name }}</span>
                  <span v-if="ingredient.notes" class="ingredient-notes">
                    ({{ ingredient.notes }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="instructions-section">
              <h2 class="section-title">Instructions</h2>
              <div class="instructions-list">
                <div
                  v-for="instruction in recipe.instructions"
                  :key="instruction.step_number"
                  class="instruction-item"
                >
                  <div class="instruction-number">
                    {{ instruction.step_number }}
                  </div>
                  <div class="instruction-content">
                    <p class="instruction-text">
                      {{ instruction.instruction }}
                    </p>
                    <div
                      v-if="instruction.time_minutes"
                      class="instruction-meta"
                    >
                      <UIcon name="i-lucide-clock" />
                      <span>{{ instruction.time_minutes }} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recipe Tags & Info -->
          <div class="recipe-footer">
            <div v-if="recipe.cuisine_type?.length" class="cuisine-tags">
              <h3>Cuisine Types</h3>
              <div class="tag-list">
                <span
                  v-for="cuisine in recipe.cuisine_type"
                  :key="cuisine"
                  class="cuisine-tag"
                >
                  {{ cuisine }}
                </span>
              </div>
            </div>

            <div
              v-if="recipe.dietary_restrictions?.length"
              class="dietary-info"
            >
              <h3>Dietary Information</h3>
              <div class="tag-list">
                <span
                  v-for="restriction in recipe.dietary_restrictions"
                  :key="restriction"
                  class="dietary-tag"
                >
                  {{ restriction }}
                </span>
              </div>
            </div>

            <div class="recipe-source-info">
              <p class="source-label">Source:</p>
              <span :class="['source-badge', `source-${recipe.source}`]">
                {{
                  recipe.source === 'global'
                    ? 'MiseBox Global'
                    : recipe.parent_app_id || 'Local'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecipes } from '../../../composables/firestore/objects/Recipe/useRecipes'

definePageMeta({
  title: 'Recipe Details',
})

const route = useRoute()
const recipeSlug = route.params.slug as string

// Get recipes data
const { data: recipes, loading, error } = await useRecipes()

// Find the specific recipe
const recipe = computed(() => {
  return recipes.value?.find((r) => r.slug === recipeSlug)
})

// Update page meta when recipe loads
watchEffect(() => {
  if (recipe.value) {
    useHead({
      title: `${recipe.value.title} - Recipe`,
      meta: [{ name: 'description', content: recipe.value.description }],
    })
  }
})
</script>

<style scoped>
.recipe-hero {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

.recipe-hero-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.recipe-hero-image {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.hero-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.hero-placeholder {
  width: 100%;
  height: 300px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 4rem;
  color: #9ca3af;
}

.recipe-hero-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin: 0;
}

.recipe-chef {
  font-size: 1.125rem;
  color: #6b7280;
}

.chef-name {
  font-weight: 600;
  color: #374151;
}

.recipe-description {
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.6;
}

.recipe-meta-bar {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.recipe-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ingredient-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #8b5cf6;
}

.ingredient-amount {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.ingredient-name {
  flex: 1;
  color: #111827;
}

.ingredient-notes {
  color: #6b7280;
  font-style: italic;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.instruction-item {
  display: flex;
  gap: 1rem;
}

.instruction-number {
  width: 32px;
  height: 32px;
  background: #8b5cf6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.instruction-content {
  flex: 1;
}

.instruction-text {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.instruction-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.recipe-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cuisine-tags h3,
.dietary-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.tag-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cuisine-tag,
.dietary-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.dietary-tag {
  background: #fef3c7;
  color: #92400e;
}

.recipe-source-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.source-label {
  color: #6b7280;
  font-weight: 500;
}

.source-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.source-global {
  background: #ddd6fe;
  color: #7c3aed;
}

.source-app_specific {
  background: #e0f2fe;
  color: #0369a1;
}

@media (min-width: 768px) {
  .recipe-hero-content {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .recipe-grid {
    grid-template-columns: 1fr 2fr;
  }

  .recipe-footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: start;
  }
}

@media (min-width: 1024px) {
  .recipe-title {
    font-size: 3rem;
  }

  .recipe-grid {
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
  }
}
</style>
