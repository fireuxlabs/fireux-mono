<template>
  <div class="landing-index-section">
    <div class="mb-6 text-center">
      <h2 class="text-2xl lg:text-3xl font-bold">Industry Ecosystems</h2>
    </div>

    <div v-if="appsPending" class="flex flex-wrap gap-2">
      <USkeleton class="h-10 w-10 rounded-lg" />
      <USkeleton class="h-10 w-10 rounded-lg" />
      <USkeleton class="h-10 w-10 rounded-lg" />
      <USkeleton class="h-10 w-10 rounded-lg" />
    </div>

    <div v-else class="flex flex-wrap justify-center gap-2">
      <UTooltip
        v-for="ecosystem in displayedEcosystems"
        :key="ecosystem.key || ecosystem.id"
        :text="ecosystem.name"
      >
        <a
          v-if="ecosystem.href"
          :href="ecosystem.href"
          :aria-label="`Open ${ecosystem.name}`"
          class="inline-flex items-center gap-2 rounded-xl border border-default bg-default/70 px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="ecosystem.src"
            :alt="ecosystem.name"
            :text="ecosystem.text"
            size="xs"
            class="rounded-lg"
          />
          <span>{{ ecosystem.name }}</span>
        </a>
        <span
          v-else
          class="inline-flex items-center gap-2 rounded-xl border border-default bg-default/70 px-3 py-2 text-sm font-medium shadow-sm"
        >
          <UAvatar
            :src="ecosystem.src"
            :alt="ecosystem.name"
            :text="ecosystem.text"
            size="xs"
            class="rounded-lg"
          />
          <span>{{ ecosystem.name }}</span>
        </span>
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLandingDirectory } from '../../composables/useLandingDirectory'

const { appsPending, displayedEcosystems } = useLandingDirectory()
</script>
