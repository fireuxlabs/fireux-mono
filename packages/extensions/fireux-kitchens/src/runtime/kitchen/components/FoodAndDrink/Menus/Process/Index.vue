<template>
  <section v-if="process.menu || process.source" class="fx-page-stack">
    <header class="fx-page-stack">
      <h3 class="fx-type-card-heading">
        {{ process.hasDraft ? 'Review menu' : 'Import menu' }}
      </h3>
      <p v-if="!process.hasDraft" class="fx-type-caption">
        {{ process.processDescription }}
      </p>
    </header>
    <KitchenFoodAndDrinkMenusProcessRun :process="process" />
    <div v-if="process.hasDraft" class="fx-page-stack">
      <KitchenFoodAndDrinkMenusProcessReport :process="process" />
      <KitchenFoodAndDrinkMenusProcessComparison :process="process" />
      <KitchenFoodAndDrinkMenusProcessReview
        :existing-menu-name="process.menu?.name"
        :source="process.source"
        :result="process.result"
        :app-id="process.activeKitchenAppId"
        :kitchen-id="process.kitchenId"
        :menu-id="process.menuId"
        :auth-token="process.authToken"
        :flags="process.flags"
        :blocked="!process.canWrite || Boolean(process.pendingMode)"
      />
    </div>
    <FireDiagnosticsDebugPanel
      v-if="process.result"
      object-origin="fetched"
      launcher
      include-route
      title="Menu process result"
      context="Menu source processing and review result."
      :objects="process.result"
      :derived="{}"
      :default-open="false"
    />
  </section>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import {
  useMenuSourceProcess,
  type MenuSourceProcessContext,
} from '../../../../composables/menu/useMenuSourceProcess'
const props = defineProps<{ context: MenuSourceProcessContext }>()
const process = reactive(useMenuSourceProcess(props.context))
</script>
