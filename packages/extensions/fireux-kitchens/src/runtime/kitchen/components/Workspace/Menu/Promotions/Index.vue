<template>
  <WorkspacePageHeader title="Promotions" variant="child">
    <template #actions>
      <UButton
        v-if="!editor && canCreate"
        label="Add promotion"
        icon="i-lucide-plus"
        @click="createPromotion"
      />
    </template>
  </WorkspacePageHeader>
  <Promotions.Controls
    v-if="!editor && canSearch"
    v-model="query"
    label="promotions"
    singular="promotion"
    :count="visible.length"
  />
  <Promotions.Collection v-if="!editor" :visible="visible" :query="query" />
  <Promotions.Create v-else :key="editor.key" />
  <Promotions.Ai />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import * as Promotions from './index'
import { provideKitchenPromotionsContext } from '../../../../composables/promotions/useKitchenPromotionsContext'
const { state, editor, canCreate, createPromotion } =
  provideKitchenPromotionsContext()
const query = ref('')
const canSearch = computed(
  () =>
    Boolean(state.kitchenId.value) &&
    !['pending', 'error'].includes(state.identity.outcome.value) &&
    !state.collection.pending.value &&
    state.collection.outcome.value !== 'error'
)
const visible = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return state.collection.items.value.filter((promotion) =>
    promotion.name.toLocaleLowerCase().includes(search)
  )
})
</script>
