<template>
  <UDashboardPanel id="console-kitchen-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
        <template #right>
          <div class="inline-flex items-center gap-1">
            <UButton
              icon="i-lucide-eye"
              size="sm"
              :variant="view === 'identity' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="View kitchen identity"
              @click="view = 'identity'"
            />

            <UButton
              icon="i-lucide-notebook-pen"
              size="sm"
              :variant="view === 'edit' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="Edit kitchen identity"
              :disabled="!canWrite"
              @click="view = 'edit'"
            />
          </div>
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
import ConsoleKitchenEdit from '../../../components/console/Kitchen/Edit.vue'
import { useKitchenConsoleIdentity } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIdentity'
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
