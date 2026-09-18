<template>
  <div class="recipe-preparation">
    <p v-if="recipe.description" class="text-toned">{{ recipe.description }}</p>
    <div class="recipe-facts">
      <UBadge
        :color="preparation.status === 'ready' ? 'success' : 'neutral'"
        variant="soft"
        >{{ preparation.status === 'ready' ? 'Reviewed' : 'Draft' }}</UBadge
      ><span>{{ preparation.yield.quantity }} {{ preparation.yield.unit }}</span
      ><span>{{ preparation.ingredients.length }} ingredients</span>
    </div>
    <p v-if="preparation.source_note" class="recipe-source">
      {{ preparation.source_note }}
    </p>
    <div class="recipe-columns">
      <section>
        <h3>Ingredients</h3>
        <ul v-if="preparation.ingredients.length" class="recipe-ingredients">
          <li v-for="(row, index) in preparation.ingredients" :key="index">
            <span
              ><strong>{{ ingredientName(row.ingredient_id) }}</strong
              ><small v-if="row.note">{{ row.note }}</small></span
            ><span>{{ row.quantity }} {{ row.unit }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted">No ingredients added.</p>
      </section>
      <section>
        <h3>Method</h3>
        <ol v-if="preparation.method.length" class="recipe-method">
          <li v-for="(step, index) in preparation.method" :key="index">
            <span>{{ index + 1 }}</span>
            <p>{{ step }}</p>
          </li>
        </ol>
        <p v-else class="text-sm text-muted">No method added.</p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '../../../utils/recipe'
import { normalizeRecipePreparation } from '../../../models/recipe-preparation'
const props = defineProps<{
  recipe: Recipe
  ingredientNames?: Record<string, string>
}>()
const preparation = computed(() =>
  normalizeRecipePreparation(props.recipe.preparation)
)
const ingredientName = (id: string) =>
  props.ingredientNames?.[id] || id.replace(/-/g, ' ')
</script>
<style scoped>
.recipe-preparation {
  display: grid;
  gap: 24px;
}
.recipe-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 13px;
  color: var(--ui-text-muted);
}
.recipe-source {
  padding: 14px 16px;
  border-left: 3px solid var(--ui-primary);
  background: var(--ui-bg-elevated);
  font-size: 13px;
  line-height: 1.6;
}
.recipe-columns {
  display: grid;
  gap: 28px;
}
h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.recipe-ingredients li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ui-border);
  font-size: 14px;
}
.recipe-ingredients strong {
  font-weight: 500;
  text-transform: capitalize;
}
.recipe-ingredients small {
  display: block;
  color: var(--ui-text-muted);
  margin-top: 4px;
}
.recipe-ingredients li > span:last-child {
  white-space: nowrap;
  color: var(--ui-text-muted);
}
.recipe-method {
  display: grid;
  gap: 20px;
}
.recipe-method li {
  display: flex;
  gap: 12px;
  font-size: 14px;
  line-height: 1.7;
}
.recipe-method li > span {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--ui-bg-elevated);
  color: var(--ui-primary);
  font-size: 12px;
}
</style>
