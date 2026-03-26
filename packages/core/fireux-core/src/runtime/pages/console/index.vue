<template>
  <LayoutsConsoleEntryShell>
    <section v-if="hubCount > 0" class="mx-auto max-w-3xl space-y-4">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-semibold">Choose a Console</h1>
        <p class="text-sm text-dimmed">
          Choose which console family you want to enter for this app.
        </p>
      </div>

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
      v-else
      color="neutral"
      variant="soft"
      title="No console hubs available"
      description="This app does not expose any console families."
      class="mx-auto max-w-2xl"
    />
  </LayoutsConsoleEntryShell>
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
  consoleEntry: true,
})

const router = useRouter()
const consoleChildren = computed(() => discoverConsoleChildren(router.getRoutes()))
const hubCount = computed(() => consoleChildren.value.length)
</script>
