<template>
  <div class="landing-index-section">
    <div class="mb-6 text-center">
      <h2 class="text-2xl lg:text-3xl font-bold">Our Apps</h2>
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
        :key="app.key || app.id"
        :text="app.name"
      >
        <a
          v-if="app.href"
          :href="app.href"
          :aria-label="`Open ${app.name}`"
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="app.src"
            :alt="app.name"
            :text="app.text"
            size="xs"
          />
          <span>{{ app.name }}</span>
        </a>
        <span
          v-else
          class="inline-flex items-center gap-2 rounded-full border border-default bg-default/70 px-2.5 py-1.5 text-sm font-medium shadow-sm"
        >
          <UAvatar
            :src="app.src"
            :alt="app.name"
            :text="app.text"
            size="xs"
          />
          <span>{{ app.name }}</span>
        </span>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLandingDirectory } from '../../composables/useLandingDirectory'

const { appsPending, displayedApps } = useLandingDirectory()
</script>
