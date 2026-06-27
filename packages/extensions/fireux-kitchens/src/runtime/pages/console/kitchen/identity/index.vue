<template>
  <UDashboardPanel id="console-kitchen-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
        <template #right>
          <UFieldGroup size="sm">
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
          </UFieldGroup>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <ConsoleKitchenIdentity v-if="view === 'identity' || !canWrite" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ConsoleKitchenIdentitySections />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/identity/useKitchenConsoleIdentity'

const navTitle = 'Identity'
const view = ref<'identity' | 'edit'>('edit')
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
