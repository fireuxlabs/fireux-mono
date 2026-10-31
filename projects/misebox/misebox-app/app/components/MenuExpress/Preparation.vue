<template>
  <section class="workspace-surface" aria-label="Menu Express preparation">
    <template v-if="!state.request?.target">
      <UFormField
        label="Kitchen ID"
        description="Choose the Kitchen this Menu belongs to. The request’s supplied files or link are transferred automatically."
        ><UInput v-model="kitchenId"
      /></UFormField>
      <UButton
        :loading="state.busy"
        :disabled="!kitchenId || state.request?.payment.status !== 'paid'"
        @click="state.act('prepare', { kitchenId })"
        >Start Menu preparation</UButton
      >
    </template>
    <template v-else>
      <UButton
        :loading="state.busy"
        variant="outline"
        @click="
          state.act('prepare', { kitchenId: state.request.target.kitchenId })
        "
        >Resume supplied source</UButton
      >
      <KitchenFoodAndDrinkMenusPreparation
        :key="`${state.request.target.kitchenId}/${state.request.target.menuId}`"
        :kitchen-id="state.request.target.kitchenId"
        :source-id="state.request.target.menuId"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
defineProps<{
  state: Pick<MenuExpressRequestView, 'request' | 'busy' | 'act'>
}>()
const { selectedId } = useWorkspace('kitchen')
const kitchenId = ref(selectedId.value || '')
</script>
