<!-- Concurrent edit — 2026-08-09 — Onboarding shell: own structure while each entity owns its journey. -->
<template>
  <section
    class="mx-auto min-w-0 w-full max-w-5xl py-4 sm:py-8"
    :data-onboarding-family="family"
    :data-onboarding-step="stage.id || undefined"
  >
    <UCard class="min-w-0 overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
      <div class="grid min-w-0 min-h-[30rem] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <aside
          class="min-w-0 border-b border-default bg-elevated/40 p-5 sm:p-8 lg:border-e lg:border-b-0"
        >
          <slot name="intro" />
        </aside>

        <main class="flex min-w-0 flex-col p-5 sm:p-8">
          <header v-if="stage.count > 1" class="mb-7">
            <p class="text-sm font-medium text-primary">
              Step {{ stage.number }} of {{ stage.count }}
            </p>
            <h2 class="mt-2 text-2xl font-semibold text-highlighted">
              {{ stage.title }}
            </h2>
            <UProgress class="mt-4" :model-value="stage.progress" :max="100" />
          </header>

          <div class="min-w-0 flex-1">
            <slot />
          </div>

          <UAlert
            v-if="stage.error"
            class="mt-6"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Unable to continue"
            :description="stage.error"
          />

          <footer
            v-if="$slots.footer"
            class="mt-8 min-w-0 border-t border-default pt-6"
          >
            <slot name="footer" />
          </footer>
        </main>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
export type OnboardingShellStage = {
  id: string | null
  title: string
  number: number
  count: number
  progress: number
  error: string
}

defineProps<{
  family: string
  stage: OnboardingShellStage
}>()
</script>
