<template>
  <UDashboardPanel id="console-kitchen-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
        <template #right>
          <UButtonGroup size="sm">
            <UButton
              icon="i-lucide-eye"
              :variant="view === 'identity' ? 'solid' : 'ghost'"
              color="neutral"
              @click="view = 'identity'"
            >
              Overview
            </UButton>

            <UButton
              icon="i-lucide-notebook-pen"
              :variant="view === 'edit' ? 'solid' : 'ghost'"
              color="neutral"
              :disabled="!canWrite"
              @click="view = 'edit'"
            >
              Edit
            </UButton>
          </UButtonGroup>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <ConsoleKitchenIdentity v-if="view === 'identity' || !canWrite" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ConsoleKitchenEdit />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useKitchenConsoleIdentity } from '../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import { ref } from 'vue'

const navTitle = 'Kitchen Identity'
const view = ref<'identity' | 'edit'>('identity')
const { canWrite } = useKitchenConsoleIdentity()

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    requiresSelection: true,
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
