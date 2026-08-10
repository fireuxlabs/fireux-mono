<template>
  <div class="landing-index-section">
    <div class="mb-6 text-center">
      <h2 class="text-2xl lg:text-3xl font-bold">Apps Powered by FireUX</h2>
    </div>

    <div v-if="appsPending" class="flex flex-wrap gap-2">
      <USkeleton class="h-10 w-10 rounded-full" />
      <USkeleton class="h-10 w-10 rounded-full" />
      <USkeleton class="h-10 w-10 rounded-full" />
      <USkeleton class="h-10 w-10 rounded-full" />
      <USkeleton class="h-10 w-10 rounded-full" />
      <USkeleton class="h-10 w-10 rounded-full" />
    </div>

    <div v-else class="flex flex-wrap justify-center gap-2">
      <UTooltip
        v-for="app in displayedApps"
        :key="app.id"
        :text="app.app_name"
      >
        <a
          v-if="app.detail_url"
          :href="app.detail_url"
          :aria-label="`Open ${app.app_name}`"
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="app.assets.logo || app.assets.thumbnail"
            :alt="app.app_name"
            :text="app.app_short_name"
            size="xs"
          />
          <span>{{ app.app_name }}</span>
        </a>
        <span
          v-else
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 text-sm font-medium shadow-sm"
        >
          <UAvatar
            :src="app.assets.logo || app.assets.thumbnail"
            :alt="app.app_name"
            :text="app.app_short_name"
            size="xs"
          />
          <span>{{ app.app_name }}</span>
        </span>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlatformAppDirectory } from '../../composables/usePlatformDirectory'

const { pending: appsPending, apps: displayedApps } = usePlatformAppDirectory()
</script>
