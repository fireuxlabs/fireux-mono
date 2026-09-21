<template>
  <div class="recipe-preparation">
    <p v-if="recipe.description" class="text-toned">{{ recipe.description }}</p>
    <div class="recipe-facts">
      <UBadge
        :color="preparation.status === 'ready' ? 'success' : 'neutral'"
        variant="soft"
        >{{ preparation.status === 'ready' ? 'Reviewed' : 'Draft' }}</UBadge
      ><span>{{ preparation.yield.quantity }} {{ preparation.yield.unit }}</span
      ><span>{{ preparation.ingredients.length }} ingredients</span
      ><span>{{ preparation.prep_items.length }} prep items</span>
    </div>
    <div class="recipe-columns">
      <div class="recipe-inputs">
        <section>
          <h3><UIcon name="i-lucide-carrot" /> Ingredients</h3>
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
        <section class="prep-panel">
          <h3><UIcon name="i-lucide-containers" /> Prep items</h3>
          <ul v-if="preparation.prep_items.length" class="recipe-ingredients">
            <li v-for="(row, index) in preparation.prep_items" :key="index">
              <span
                ><strong>{{
                  prepItemNames?.[row.prep_item_id] ||
                  row.prep_item_id.replace(/-/g, ' ')
                }}</strong
                ><small v-if="row.note">{{ row.note }}</small>
                <details v-if="prepById[row.prep_item_id]" class="mt-3 text-sm">
                  <summary class="cursor-pointer text-primary">
                    View preparation
                  </summary>
                  <div class="mt-3 space-y-2">
                    <p
                      v-for="input in prepById[row.prep_item_id].inputs"
                      :key="input.ingredient_id"
                    >
                      {{ ingredientName(input.ingredient_id) }} ·
                      {{ input.quantity }} {{ input.unit }}
                    </p>
                    <p class="text-muted">
                      Yield: {{ prepById[row.prep_item_id].yield.quantity }}
                      {{ prepById[row.prep_item_id].yield.unit }}
                    </p>
                    <p
                      v-for="(step, stepIndex) in prepById[row.prep_item_id]
                        .method"
                      :key="stepIndex"
                    >
                      {{ step }}
                    </p>
                  </div>
                </details>
              </span>
              <span>{{ row.quantity }} {{ row.unit }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-muted">No prep items.</p>
        </section>
      </div>
      <section class="method-panel">
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
    <details v-if="preparation.source_note" class="recipe-source">
      <summary>Kitchen notes</summary>
      <p class="mt-3">{{ preparation.source_note }}</p>
    </details>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenPrepItem } from '../../../models/prep-item.model'
import type { Recipe } from '../../../utils/recipe'
import { normalizeRecipePreparation } from '../../../models/recipe-preparation'
const props = defineProps<{
  recipe: Recipe
  ingredientNames?: Record<string, string>
  prepItemNames?: Record<string, string>
  prepItems?: KitchenPrepItem[]
}>()
const prepById = computed(() =>
  Object.fromEntries((props.prepItems ?? []).map((item) => [item.id, item]))
)
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
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  background: var(--ui-bg-elevated);
  font-size: 13px;
  line-height: 1.6;
}
.recipe-columns {
  display: grid;
  gap: 32px;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.2fr);
}
.recipe-inputs {
  display: grid;
  gap: 24px;
  align-content: start;
}
.recipe-inputs section {
  padding: 20px;
  border: 1px solid var(--ui-border);
  border-radius: 14px;
}
.prep-panel {
  background: var(--ui-bg-elevated);
}
@media (max-width: 800px) {
  .recipe-columns {
    grid-template-columns: 1fr;
  }
}
h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
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
