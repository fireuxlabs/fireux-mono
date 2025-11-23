<template>
  <div v-if="ingredient" class="objects profile ingredient-profile">
    <!-- Header Section -->
    <div class="profile-header">
      <div class="profile-info">
        <h1 class="title">{{ ingredient.name }}</h1>
        <div class="subtitle">Ingredient</div>
        <p v-if="ingredient.description" class="description">
          {{ ingredient.description }}
        </p>
      </div>
    </div>

    <!-- Categories -->
    <div v-if="ingredient.categories?.length" class="section">
      <h3>Categories</h3>
      <div class="tags">
        <span
          v-for="category in ingredient.categories"
          :key="category"
          class="tag"
        >
          {{ category }}
        </span>
      </div>
    </div>

    <!-- Nutritional Info -->
    <div v-if="ingredient.nutrition" class="section">
      <h3>Nutritional Information</h3>
      <div class="nutrition-grid">
        <div v-if="ingredient.nutrition.calories" class="nutrition-item">
          <strong>Calories:</strong> {{ ingredient.nutrition.calories }}
        </div>
        <div v-if="ingredient.nutrition.protein" class="nutrition-item">
          <strong>Protein:</strong> {{ ingredient.nutrition.protein }}g
        </div>
        <div v-if="ingredient.nutrition.carbs" class="nutrition-item">
          <strong>Carbs:</strong> {{ ingredient.nutrition.carbs }}g
        </div>
        <div v-if="ingredient.nutrition.fat" class="nutrition-item">
          <strong>Fat:</strong> {{ ingredient.nutrition.fat }}g
        </div>
      </div>
    </div>

    <!-- Storage Info -->
    <div v-if="ingredient.storage" class="section">
      <h3>Storage Information</h3>
      <div class="storage-info">
        <div v-if="ingredient.storage.method" class="storage-item">
          <strong>Method:</strong> {{ ingredient.storage.method }}
        </div>
        <div v-if="ingredient.storage.temperature" class="storage-item">
          <strong>Temperature:</strong> {{ ingredient.storage.temperature }}
        </div>
        <div v-if="ingredient.storage.shelf_life" class="storage-item">
          <strong>Shelf Life:</strong> {{ ingredient.storage.shelf_life }}
        </div>
      </div>
    </div>

    <!-- Allergens -->
    <div v-if="ingredient.allergens?.length" class="section">
      <h3>Allergens</h3>
      <div class="tags allergen-tags">
        <span
          v-for="allergen in ingredient.allergens"
          :key="allergen"
          class="tag allergen"
        >
          ⚠️ {{ allergen }}
        </span>
      </div>
    </div>

    <!-- Meta Information -->
    <div class="meta-section">
      <div class="meta-item"><strong>ID:</strong> {{ ingredient.id }}</div>
      <div v-if="ingredient.created_at" class="meta-item">
        <strong>Added:</strong>
        {{ new Date(ingredient.created_at).toLocaleDateString() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '../../../../models/objects/Ingredient.model'

defineProps<{
  ingredient: Ingredient | null
}>()
</script>

<style scoped>
/* Uses centralized objects.scss styles plus specific enhancements */

.profile-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.profile-info h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--gray-800);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--gray-100);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}

.allergen {
  background: var(--red-50);
  color: var(--red-700);
  border: 1px solid var(--red-200);
}

.nutrition-grid,
.storage-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.nutrition-item,
.storage-item {
  background: var(--gray-50);
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--gray-200);
}

.meta-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
  font-size: 0.875rem;
  color: var(--gray-600);
}

.meta-item {
  margin-bottom: 0.5rem;
}
</style>
