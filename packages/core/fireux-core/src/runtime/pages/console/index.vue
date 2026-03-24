<!-- packages/core/fireux-core/src/runtime/pages/console/index.vue -->
<template>
  <UDashboardPanel id="console-home">
    <template #header>
      <LayoutsConsoleNavbar title="Console" />
    </template>

    <template #body>
      <section v-if="hubCount > 0" class="space-y-4">
        <p class="text-sm text-dimmed">
          Choose which console family you want to enter for this app.
        </p>

        <UCard>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="hub in consoleChildren"
              :key="hub.key"
              :to="hub.path"
              variant="soft"
              color="primary"
              block
            >
              {{ toConsoleScopeLabel(hub.key) }}
            </UButton>
          </div>
        </UCard>
      </section>

      <UAlert
        v-if="hubCount === 0"
        color="neutral"
        variant="soft"
        title="No console hubs available"
        description="This app does not expose any console families."
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  discoverConsoleChildren,
  toConsoleScopeLabel,
} from '../../composables/fireux/app/routing/consoleRoutes'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
})

const router = useRouter()
const consoleChildren = computed(() => discoverConsoleChildren(router.getRoutes()))
const hubCount = computed(() => consoleChildren.value.length)
</script>
