<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <DashboardOverview>
            <template v-if="workspaceComponent" #workspace>
              <component :is="workspaceComponent" />
            </template>
          </DashboardOverview>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'
import DashboardOverview from './Overview.vue'

const workspaceComponent = useNuxtApp().vueApp.component('DashboardWorkspace')
</script>
