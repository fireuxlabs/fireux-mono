<template>
  <template v-if="!storageKitchenId">
    <UAlert
      v-if="outcome === 'error'"
      title="Kitchen unavailable"
      description="Your Kitchen could not be loaded. Please try again."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          message="Kitchen unavailable&#10;Your Kitchen could not be loaded. Please try again."
        />
      </template>
    </UAlert>
    <p v-else-if="outcome === 'pending'" role="status">Loading Kitchen…</p>
    <UAlert
      v-else-if="outcome === 'empty'"
      color="neutral"
      title="Kitchen not found"
      description="Choose an available Kitchen to manage its Ingredients."
    />
    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing ingredients."
    />
  </template>
  <template v-else>
    <UAlert
      v-if="loadError"
      title="Ingredients unavailable"
      :description="errorMessage"
      icon="i-lucide-triangle-alert"
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          :message="
            ['Ingredients unavailable', errorMessage].filter(Boolean).join('\n')
          "
        />
      </template>
    </UAlert>
    <FireState v-else-if="pending" outcome="pending" entity="ingredients" />
    <template v-else>
      <section
        v-for="group in groups"
        :key="group.value"
        :aria-labelledby="`ingredients-${group.value}`"
        class="ingredient-group"
      >
        <div class="ingredient-group__heading">
          <h2 :id="`ingredients-${group.value}`" class="fx-type-card-heading">
            {{ group.label }}
          </h2>
          <span class="fx-type-caption">{{ group.cards.length }}</span>
        </div>
        <div
          :class="layout === 'grid' ? 'ingredient-grid' : 'collection-stack'"
        >
          <KitchenWorkspacePrepIngredientsCardsCell
            v-for="card in group.cards"
            :key="card.id"
            :id="card.id"
            :to="card.to"
            :title="card.title"
            :image-url="card.hasImage ? card.imageUrl : ''"
            :icon="group.icon"
            :category-label="group.label"
            :variant="layout"
            @image-error="failedImages[card.id] = card.imageUrl"
          />
        </div>
      </section>
      <div v-if="!groups.length" role="status" class="ingredient-empty">
        <UIcon
          :name="cards.length ? 'i-lucide-search' : 'i-lucide-carrot'"
          aria-hidden="true"
        />
        <h2 class="fx-type-card-heading">
          {{ cards.length ? 'No matching ingredients' : 'No ingredients yet' }}
        </h2>
        <p class="fx-type-caption">
          {{
            cards.length
              ? 'Try another name, category or image filter.'
              : 'Add the ingredients your kitchen uses from the shared catalogue.'
          }}
        </p>
      </div>
      <UPagination
        v-if="visibleCount > pageSize"
        v-model:page="page"
        :total="visibleCount"
        :items-per-page="pageSize"
        :sibling-count="1"
      />
    </template>
  </template>
</template>

<script setup lang="ts">
import { requireKitchenWorkspacePrepIngredients } from '../../../../../composables/workspace/prep/ingredients/state'
import { requireIngredientCatalogue } from '../useCatalogue'

const { storageKitchenId, outcome, pending, loadError } =
  requireKitchenWorkspacePrepIngredients()
const { layout, failedImages, cards, groups, visibleCount, page, pageSize } =
  requireIngredientCatalogue()
const errorMessage = 'Your ingredients could not be loaded. Please try again.'
</script>

<style scoped>
.ingredient-group {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}
.ingredient-group__heading {
  display: flex;
  align-items: baseline;
  gap: calc(var(--spacing) * 2);
}
.ingredient-group__heading h2,
.ingredient-empty h2,
.ingredient-empty p {
  margin: 0;
}
.ingredient-empty {
  display: grid;
  justify-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 8);
  border: 1px dashed var(--ui-border);
  border-radius: var(--ui-radius);
  text-align: center;
}
.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 9.5rem), 1fr));
  gap: 1rem;
}
</style>
