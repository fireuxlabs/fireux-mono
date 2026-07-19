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
        :key="ecosystem.id"
        :text="ecosystem.name"
      >
        <a
          v-if="ecosystem.canonical_url"
          :href="ecosystem.canonical_url"
          :aria-label="`Open ${ecosystem.name}`"
          class="inline-flex items-center gap-2 rounded-xl border border-default bg-default/70 px-3 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <UAvatar
            :src="ecosystem.image_url"
            :alt="ecosystem.name"
            :text="ecosystem.name"
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
            :src="ecosystem.image_url"
            :alt="ecosystem.name"
            :text="ecosystem.name"
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
import { usePlatformEcosystemDirectory } from '../../composables/usePlatformDirectory'

const { pending: appsPending, ecosystems: displayedEcosystems } =
  usePlatformEcosystemDirectory()
</script>
