<template>
  <section class="workspace-surface" aria-label="Menu Express preparation">
    <template v-if="!state.request?.target">
      <FireState
        :outcome="targets.outcome"
        entity="Kitchens"
        :error="targets.error"
      />
      <UFormField
        label="Prepare in Kitchen"
        description="Choose an existing Kitchen you can manage. Source files transfer automatically; this does not create another Kitchen."
      >
        <USelect
          v-model="kitchenId"
          :items="kitchenOptions"
          placeholder="Choose a Kitchen"
          :disabled="targets.outcome !== 'ready' || state.busy"
        />
      </UFormField>
      <UButton
        v-if="targets.outcome === 'empty'"
        to="/workspace"
        variant="outline"
        >Open Kitchen Workspace</UButton
      >
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
      <KitchenWorkspaceMenuMenusPreparation
        :key="`${state.request.target.kitchenId}/${state.request.target.menuId}`"
        :kitchen-id="state.request.target.kitchenId"
        :source-id="state.request.target.menuId"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import KitchenWorkspaceMenuMenusPreparation from 'fireux-kitchens/runtime/kitchen/components/Workspace/Menu/Menus/Preparation.vue'
import { computed, reactive, ref } from 'vue'
import { useKitchenCollection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenCollection'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
defineProps<{
  state: Pick<MenuExpressRequestView, 'request' | 'busy' | 'act'>
}>()
const targets = reactive(useKitchenCollection())
const chosenId = ref('')
const kitchenOptions = computed(() =>
  targets.kitchens.map((kitchen) => ({
    label: kitchen.name || 'Unnamed Kitchen',
    value: kitchen.id,
  }))
)
const kitchenId = computed({
  get: () => {
    if (targets.outcome !== 'ready') return ''
    const ids = targets.kitchens.map((kitchen) => kitchen.id)
    if (ids.includes(chosenId.value)) return chosenId.value
    return ids.length === 1 ? ids[0]! : ''
  },
  set: (id: string) => {
    chosenId.value = id
  },
})
</script>
