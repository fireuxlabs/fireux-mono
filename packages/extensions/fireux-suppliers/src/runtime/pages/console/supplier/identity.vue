<template>
  <UDashboardPanel id="console-supplier-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
        <template #right>
          <div class="inline-flex items-center gap-1">
            <UButton
              icon="i-lucide-eye"
              size="sm"
              :variant="view === 'identity' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="View supplier identity"
              @click="view = 'identity'"
            />

            <UButton
              icon="i-lucide-notebook-pen"
              size="sm"
              :variant="view === 'edit' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="Edit supplier identity"
              :disabled="!canWrite"
              @click="view = 'edit'"
            />
          </div>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <ConsoleSupplierIdentity v-if="view === 'identity' || !canWrite" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ConsoleSupplierEdit />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useSupplierConsoleIdentity } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleIdentity'
import { ref } from 'vue'

const navTitle = 'Supplier Identity'
const view = ref<'identity' | 'edit'>('identity')
const { canWrite } = useSupplierConsoleIdentity()

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-identity',
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
