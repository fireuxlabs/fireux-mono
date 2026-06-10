<template>
  <UDashboardPanel id="console-portfolio-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
        <template #right>
          <div class="inline-flex items-center gap-1">
            <UButton
              icon="i-lucide-eye"
              size="sm"
              :variant="view === 'identity' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="View portfolio identity"
              @click="view = 'identity'"
            />

            <UButton
              icon="i-lucide-notebook-pen"
              size="sm"
              :variant="view === 'edit' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="Edit portfolio identity"
              :disabled="!canWrite"
              @click="view = 'edit'"
            />
          </div>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <ConsolePortfolioIdentity v-if="view === 'identity' || !canWrite" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <ConsolePortfolioIdentityEdit />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIdentity } from '../../../composables/fireux/console/portfolio/Identity/usePortfolioConsoleIdentity'
import { ref } from 'vue'

const navTitle = 'Portfolio Identity'
const view = ref<'identity' | 'edit'>('identity')
const { canWrite } = usePortfolioConsoleIdentity()

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-portfolio-identity',
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
