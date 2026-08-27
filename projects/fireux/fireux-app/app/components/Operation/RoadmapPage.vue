<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Operation roadmaps: share the small public checklist page shape. -->
<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/operations#project" variant="link" class="px-0">
          Operations
        </UButton>
        <UPageHeader
          :title="title"
          :description="description"
          headline="Project workspace"
        />
        <UPageBody class="space-y-4">
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
                  :name="
                    item.done ? 'i-lucide-circle-check' : 'i-lucide-circle'
                  "
                  :class="item.done ? 'text-primary' : 'text-muted'"
                  class="size-5 shrink-0"
                />
                <span :class="item.done ? 'text-highlighted' : 'text-muted'">
                  {{ item.label }}
                </span>
              </li>
            </ul>
          </UCard>

          <div class="flex flex-wrap gap-3">
            <UButton :to="action.to" :icon="action.icon">
              {{ action.label }}
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
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
