<template>
  <section v-if="process.menu || process.source" class="space-y-4">
    <header class="space-y-1">
      <h3 class="text-sm font-semibold text-highlighted">
        Convert menu with AI
      </h3>
      <p class="text-sm text-dimmed">{{ process.processDescription }}</p>
    </header>
    <WorkspaceKitchenMenusProcessRun :process="process" />
    <div v-if="process.hasDraft" class="space-y-4">
      <WorkspaceKitchenMenusProcessReport :process="process" />
      <WorkspaceKitchenMenusProcessComparison :process="process" />
      <WorkspaceKitchenMenusProcessReview
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
    <DiagnosticsDebugPanel
      v-if="process.result"
      object-origin="fetched"
      launcher
      include-route
      title="Menu process result"
      context="Kitchen menu process · /workspace/kitchen/menus/[menuId]"
      :objects="process.result"
      :derived="{}"
      :default-open="false"
    />
  </section>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuSourceProcess } from '../../../../composables/workspace/menus/useMenuSourceProcess'
const process = reactive(useMenuSourceProcess())
</script>
