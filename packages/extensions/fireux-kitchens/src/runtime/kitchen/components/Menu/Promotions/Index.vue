<template>
  <section>
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
    <WorkspaceKitchenAIFocus
      focus="kitchen-ai.menu.promotions"
      label="Promotions"
      context-label="Menu"
    />
    <KitchenMenuPromotionsEditor v-if="editor" :key="editor.key" />
    <KitchenMenuPromotionsCollection v-else />
  </section>
</template>
<script setup lang="ts">
import { provideKitchenPromotionsContext } from '../../../composables/promotions/useKitchenPromotionsContext'
const { editor, canCreate, createPromotion } = provideKitchenPromotionsContext()
</script>
