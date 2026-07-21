<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Operation roadmaps: share the small public checklist page shape. -->
<template>
  <PublicSimplePage
    :title="title"
    :description="description"
    eyebrow="Project console"
    back-to="/operations#project"
    back-label="Operations"
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="m-0 text-lg font-semibold text-highlighted">
          Roadmap
        </h2>
      </template>

      <ul class="grid gap-3">
        <li
          v-for="item in items"
          :key="item.label"
          class="flex items-center gap-3 text-sm"
        >
          <UIcon
            :name="item.done ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            :class="item.done ? 'text-primary' : 'text-muted'"
            class="size-5 shrink-0"
          />
          <span :class="item.done ? 'text-highlighted' : 'text-muted'">
            {{ item.label }}
          </span>
        </li>
      </ul>
    </UCard>

    <template #actions>
      <UButton :to="action.to" :icon="action.icon">
        {{ action.label }}
      </UButton>
    </template>
  </PublicSimplePage>
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
