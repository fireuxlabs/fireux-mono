<template>
  <section class="mx-auto grid w-full max-w-5xl gap-4">
    <UAlert
      v-if="outcome === 'denied'"
      color="warning"
      title="Menu access unavailable"
      description="Sign in with access to this Kitchen to open its menus."
    />
    <MoleculesCopyError v-else-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading Menu…</p>
    <UAlert
      v-else-if="outcome === 'idle'"
      color="neutral"
      title="Select a Kitchen"
    />
    <UAlert
      v-else-if="!menu"
      color="neutral"
      :title="selectedKitchen ? 'Menu not found' : 'Kitchen not found'"
    />
    <template v-else>
      <UAlert v-if="!canWrite" color="neutral" title="Read-only Menu" />
      <KitchenFoodAndDrinkMenusPublicationReadiness
        v-if="menu.schedule !== 'daily' && menu.status !== 'archived'"
        :key="`${menuState.storageKitchenId.value}/${menu.id}/${sectionState.sectionId.value}`"
        :section-context="sectionState"
      />
      <KitchenFoodAndDrinkMenusItemsEdit />
    </template>
  </section>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { provideMenuSection } from '../../../../../../menu/composables/useMenuSection'
import { provideKitchenMenuRecordContext } from '../../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const menuState = provideKitchenMenuRecordContext()
const { menu, outcome, error, pending, canWrite, selectedKitchen } = menuState
const sectionState = provideMenuSection(menuState, useRouteParam('sectionId'))
</script>
