<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <DashboardOverview>
            <template v-if="$slots.workspace" #workspace
              ><slot name="workspace"
            /></template>
          </DashboardOverview>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import DashboardOverview from './Overview.vue'
</script>
