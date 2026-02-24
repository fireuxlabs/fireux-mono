<template>
  <UPageSection class="py-12 lg:py-16">
    <section>
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-2xl lg:text-3xl font-bold">Our Ecosystems</h2>
        </div>
        <UBadge variant="soft" color="primary">{{ displayedEcosystems.length }}</UBadge>
      </div>

      <div v-if="appsPending" class="flex flex-wrap gap-2">
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-10 w-10 rounded-lg" />
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <UTooltip
          v-for="ecosystem in displayedEcosystems"
          :key="ecosystem.key"
          :text="ecosystem.name"
        >
          <a
            v-if="ecosystem.href"
            :href="ecosystem.href"
            :aria-label="`Open ${ecosystem.name}`"
            class="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <UAvatar
              :src="ecosystem.src"
              :alt="ecosystem.name"
              :text="ecosystem.text"
              size="md"
              class="rounded-lg"
            />
          </a>
          <UAvatar
            v-else
            :src="ecosystem.src"
            :alt="ecosystem.name"
            :text="ecosystem.text"
            size="md"
            class="rounded-lg"
          />
        </UTooltip>
      </div>
    </section>
  </UPageSection>
</template>

<script setup lang="ts">
const { appsPending, displayedEcosystems } = useLandingDirectory()
</script>
