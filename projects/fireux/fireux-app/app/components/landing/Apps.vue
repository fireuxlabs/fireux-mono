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
        :key="app.key"
        :text="app.name"
      >
        <a
          v-if="app.href"
          :href="app.href"
          :aria-label="`Open ${app.name}`"
          class="inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="app.src"
            :alt="app.name"
            :text="app.text"
            size="md"
          />
        </a>
        <UAvatar
          v-else
          :src="app.src"
          :alt="app.name"
          :text="app.text"
          size="md"
        />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLandingDirectory } from '../../composables/useLandingDirectory'

const { appsPending, displayedApps } = useLandingDirectory()
</script>
