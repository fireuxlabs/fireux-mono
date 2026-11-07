<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Operation roadmaps: share the small public checklist page shape. -->
<template>
  <UPage>
    <UButton to="/operations#project" variant="link"> Operations </UButton>
    <UPageHeader
      :title="title"
      :description="description"
      headline="Project workspace"
    />
    <UPageBody>
      <UCard variant="subtle">
        <template #header>
          <h2 class="fx-type-section-title">Roadmap</h2>
        </template>

        <ul class="fx-list-stack">
          <li v-for="item in items" :key="item.label">
            <UIcon
              :name="item.done ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            />
            <span>
              {{ item.label }}
            </span>
          </li>
        </ul>
      </UCard>

      <div class="fx-card__actions">
        <UButton :to="action.to" :icon="action.icon">
          {{ action.label }}
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  items: readonly {
    label: string
    done: boolean
  }[]
  action: {
    label: string
    to: string
    icon: string
  }
}>()
</script>
