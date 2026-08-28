<template>
  <section class="workspace-surface">
    <div class="grid min-h-[calc(100dvh-8rem)] grid-rows-[1fr_auto] py-6">
      <div class="grid content-center gap-6 py-12 sm:py-16">
        <WorkspaceKitchenHero />
        <WorkspaceKitchenAI />
      </div>

      <UButton
        to="#kitchen-main-content"
        icon="i-lucide-arrow-down"
        color="neutral"
        variant="ghost"
        size="xl"
        class="mx-auto rounded-full"
        aria-label="Explore the Kitchen Workspace"
      />
    </div>

    <div id="kitchen-main-content" class="grid scroll-mt-6 gap-6">
      <WorkspaceKitchen />
    </div>

    <ClientOnly>
      <pre v-if="isDev" class="overflow-x-auto text-xs text-muted">{{
        state
      }}</pre>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceMain } from 'fireux-kitchens/runtime/kitchen/composables/workspace/main/useKitchenWorkspaceMain'

const isDev = import.meta.dev
const { state } = useKitchenWorkspaceMain()
</script>
