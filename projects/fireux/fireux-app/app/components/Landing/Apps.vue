<template>
  <div class="landing-index-section">
    <div class="mb-6">
      <h2 class="fx-type-section-title">Apps Powered by FireUX</h2>
    </div>

    <div v-if="appsPending" class="flex flex-wrap gap-2">
      <USkeleton />
      <USkeleton />
      <USkeleton />
      <USkeleton />
      <USkeleton />
      <USkeleton />
    </div>

    <div v-else class="flex flex-wrap justify-center gap-2">
      <UTooltip v-for="app in displayedApps" :key="app.id" :text="app.name">
        <a
          v-if="`/apps/${encodeURIComponent(app.id)}`"
          :href="`/apps/${encodeURIComponent(app.id)}`"
          :aria-label="`Open ${app.name}`"
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="app.media?.logo_url || app.media?.thumbnail_url"
            :alt="app.name"
            :text="app.short_name"
            size="xs"
          />
          <span>{{ app.name }}</span>
        </a>
        <span
          v-else
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 shadow-sm"
        >
          <UAvatar
            :src="app.media?.logo_url || app.media?.thumbnail_url"
            :alt="app.name"
            :text="app.short_name"
            size="xs"
          />
          <span>{{ app.name }}</span>
        </span>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppCollection } from 'fireux-core/runtime/app/composables/useAppCollection'

const { pending: appsPending, apps: displayedApps } = useAppCollection(
  '/api/platform/apps?limit=24'
)
</script>
