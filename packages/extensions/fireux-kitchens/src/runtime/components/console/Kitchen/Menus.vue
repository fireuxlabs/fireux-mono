<template>
  <section class="console-surface space-y-4">
    <UCard v-if="!kitchen">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Kitchen Menus</div>
        </div>
      </template>

      <p class="console-card-header__description">
        No kitchen selected.
      </p>
    </UCard>

    <OrganismsMenuCollectionManager
      v-else
      :collection="menus"
      title="Menus"
      description="Browse menus for the selected kitchen."
      :link="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import { useKitchenConsoleMenus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { kitchen } = useKitchenConsole()
const { menus } = useKitchenConsoleMenus()
</script>