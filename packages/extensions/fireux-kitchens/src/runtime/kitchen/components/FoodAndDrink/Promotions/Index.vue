<template>
  <section class="mx-auto grid w-full max-w-4xl gap-6">
    <WorkspaceKitchenCollectionHeader title="Promotions">
      <template #actions>
        <UButton
          v-if="!editor && canCreate"
          label="Add promotion"
          icon="i-lucide-plus"
          @click="createPromotion"
        />
      </template>
    </WorkspaceKitchenCollectionHeader>
    <KitchenFoodAndDrinkPromotionsEditor v-if="editor" :key="editor.key" />
    <KitchenFoodAndDrinkPromotionsCollection v-else />
  </section>
</template>
<script setup lang="ts">
import { provideKitchenPromotionsContext } from '../../../composables/promotions/useKitchenPromotionsContext'
const { editor, canCreate, createPromotion } = provideKitchenPromotionsContext()
</script>
