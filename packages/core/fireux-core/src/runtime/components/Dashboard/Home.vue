<template>
  <UDashboardPanel id="home">
    <template #header>
      <FireLayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <FireDashboardOverview>
            <template v-if="workspaceComponent" #workspace>
              <component :is="workspaceComponent" />
            </template>
          </FireDashboardOverview>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'
import FireDashboardOverview from './Overview.vue'

const workspaceComponent = useNuxtApp().vueApp.component('DashboardWorkspace')
</script>
