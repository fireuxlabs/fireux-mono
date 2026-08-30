<template>
  <UPageHeader
    :title="app.name || app.id"
    :description="app.tagline || app.description || app.short_bio"
  >
    <template #headline>FireUX App</template>
    <template #links>
      <UButton
        to="/apps"
        label="All Apps"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
      <UButton
        :to="`/get-started?example=${encodeURIComponent(app.id)}`"
        label="Start an App like this"
        icon="i-lucide-rocket"
      />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
import type { App } from 'fireux-core/runtime/app/models/app.model'

defineProps<{ app: App }>()
</script>
