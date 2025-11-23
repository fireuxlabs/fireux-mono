<template>
  <ClientOnly>
    <div>
      <div v-if="ingredient">
        <MiseObjectsIngredientProfile :ingredient="ingredient" />

        <!-- Edit Ingredient Button (shown when user can edit) -->
        <div class="edit-object-section">
          <button @click="navigateToEdit" class="edit-object-button">
            Edit Ingredient
          </button>
        </div>
      </div>
      <div v-else class="error-state">
        <h1>Ingredient Not Found</h1>
        <p>The ingredient you're looking for doesn't exist.</p>
        <a href="/ingredients" class="back-link">← Back to Ingredients</a>
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading ingredient...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useIngredient } from '../../composables/firestore/objects/ingredients/useIngredient'

const route = useRoute()
const ingredientId = route.params.id as string

// Get the specific ingredient
const { getById } = useIngredient()
const ingredient = getById(ingredientId)

// Navigation functions
const navigateToEdit = () => {
  // navigateTo(`/ingredients/${ingredientId}/edit`)
  console.log('Navigate to edit:', ingredientId)
}
</script>

<style scoped>
.edit-object-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-200);
}

.edit-object-button {
  margin-right: 1rem;
}

.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--gray-600);
}

.back-link {
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
