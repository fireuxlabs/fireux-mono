<!-- Concurrent edit — 2026-08-09 — Onboarding shell: own structure while each entity owns its journey. -->
<template>
  <section
    :data-onboarding-family="family"
    :data-onboarding-step="stage.id || undefined"
  >
    <UCard>
      <div>
        <aside>
          <slot name="intro" />
        </aside>

        <div>
          <header v-if="stage.count > 1">
            <p>Step {{ stage.number }} of {{ stage.count }}</p>
            <h2>
              {{ stage.title }}
            </h2>
            <UProgress :model-value="stage.progress" :max="100" />
          </header>

          <div>
            <slot />
          </div>

          <UAlert
            v-if="stage.error"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Unable to continue"
            :description="stage.error"
          />

          <footer v-if="$slots.footer">
            <slot name="footer" />
          </footer>
        </div>
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
