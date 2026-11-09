<template>
  <section>
    <div>
      <h3>Ingredients</h3>
      <UButton
        label="Add ingredient"
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="
          rows.push({ ingredient_id: '', quantity: 1, unit: 'g', note: '' })
        "
      />
    </div>
    <FireStateCard
      v-if="error"
      state="error"
      title="Ingredients unavailable"
      :description="String(error)"
    />
    <p v-else-if="!pending && !options.length">
      Add ingredients to this kitchen first.
      <NuxtLink to="/workspace/kitchen/prep/ingredients"
        >Open ingredients</NuxtLink
      >
    </p>
    <div v-for="(row, index) in rows" :key="index" class="recipe-input-row">
      <div class="recipe-input-name">
        <USelect
          v-model="row.ingredient_id"
          :items="options"
          value-key="value"
          placeholder="Ingredient"
          :aria-label="`Ingredient ${index + 1}`"
          :loading="pending"
        />
      </div>
      <UInput
        v-model="row.quantity"
        type="number"
        min="0.001"
        step="any"
        :aria-label="`Quantity ${index + 1}`"
        placeholder="Qty"
      />
      <UInput
        v-model="row.unit"
        :aria-label="`Unit ${index + 1}`"
        placeholder="g, ml, each"
      />
      <UButton
        icon="i-lucide-x"
        :aria-label="`Remove ingredient ${index + 1}`"
        color="neutral"
        variant="ghost"
        @click="rows.splice(index, 1)"
      />
      <UInput
        v-model="row.note"
        :aria-label="`Preparation note ${index + 1}`"
        placeholder="Preparation note (optional)"
        class="recipe-input-note"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import type { RecipeIngredient } from '../../../../models/recipe-preparation'
const rows = defineModel<RecipeIngredient[]>({ required: true })
defineProps<{
  options: Array<{ label: string; value: string }>
  error?: unknown
  pending?: boolean
}>()
</script>

<style scoped src="../../../../assets/styles/recipe-input-rows.css" />
