<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="font-semibold">Prep items</h3>
      <UButton
        label="Add prep item"
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="
          rows.push({ prep_item_id: '', quantity: 1, unit: 'g', note: '' })
        "
      />
    </div>
    <MoleculesStateCard
      v-if="error"
      state="error"
      title="Prep items unavailable"
      :description="String(error)"
    />
    <div v-for="(row, index) in rows" :key="index" class="recipe-input-row">
      <div class="recipe-input-name min-w-0">
        <USelect
          v-model="row.prep_item_id"
          :items="options"
          placeholder="Prep item"
          :aria-label="`Prep item ${index + 1}`"
          class="w-full"
        />
      </div>
      <UInput
        v-model="row.quantity"
        type="number"
        min="0.001"
        step="any"
        :aria-label="`Prep quantity ${index + 1}`"
      />
      <UInput v-model="row.unit" :aria-label="`Prep unit ${index + 1}`" />
      <UButton
        icon="i-lucide-x"
        :aria-label="`Remove prep item ${index + 1}`"
        color="neutral"
        variant="ghost"
        @click="rows.splice(index, 1)"
      />
      <UInput
        v-model="row.note"
        :aria-label="`Prep note ${index + 1}`"
        placeholder="Quantity basis or service note"
        class="recipe-input-note"
      />
    </div>
    <slot />
  </section>
</template>
<script setup lang="ts">
import type { RecipePrepItem } from '../../../../models/recipe-preparation'
const rows = defineModel<RecipePrepItem[]>({ required: true })
defineProps<{
  options: Array<{ label: string; value: string }>
  error?: unknown
}>()
</script>

<style scoped src="./input-rows.css" />
