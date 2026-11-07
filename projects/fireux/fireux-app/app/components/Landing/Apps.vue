<template>
  <div class="landing-index-section">
    <div>
      <h2 class="fx-type-section-title">Apps Powered by FireUX</h2>
    </div>

    <div v-if="appsPending">
      <USkeleton />
      <USkeleton />
      <USkeleton />
      <USkeleton />
      <USkeleton />
      <USkeleton />
    </div>

    <div v-else>
      <UTooltip v-for="app in displayedApps" :key="app.id" :text="app.name">
        <ULink
          v-if="`/apps/${encodeURIComponent(app.id)}`"
          :to="`/apps/${encodeURIComponent(app.id)}`"
          :aria-label="`Open ${app.name}`"
        >
          <UAvatar
            :src="app.media?.logo_url || app.media?.thumbnail_url"
            :alt="app.name"
            :text="app.short_name"
            size="xs"
          />
          <span>{{ app.name }}</span>
        </ULink>
        <span v-else>
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
