<template>
  <main class="min-h-screen bg-default text-default">
    <header class="border-b border-default bg-default">
      <UContainer class="flex items-center justify-between gap-4 py-4">
        <NuxtLink to="/" class="inline-flex items-center gap-3 text-sm font-semibold text-primary">
          <img src="/img/app/logo.png" alt="" class="size-8 rounded" />
          <span>Sproochli</span>
        </NuxtLink>

        <UButton to="/bnb" icon="i-lucide-house" color="neutral" variant="ghost">
          BNB
        </UButton>
      </UContainer>
    </header>

    <UContainer
      v-if="guide"
      class="grid min-w-0 gap-6 py-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-8"
    >
      <aside class="min-w-0 lg:pt-1">
        <nav class="lg:sticky lg:top-6" aria-label="BNB guide navigation">
          <div class="flex max-w-full gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
            <NuxtLink
              :to="`/bnb/${guide.slug}`"
              class="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-default"
              :class="{ 'bg-elevated font-semibold text-default': !currentSectionId }"
            >
              Welcome
            </NuxtLink>
            <NuxtLink
              v-for="section in topics"
              :key="section.id"
              :to="`/bnb/${guide.slug}/${section.id}`"
              class="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-default"
              :class="{ 'bg-elevated font-semibold text-default': currentSectionId === section.id }"
            >
              {{ section.title }}
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <div class="min-w-0">
        <slot />
      </div>
    </UContainer>

    <UContainer v-else class="py-8">
      <slot />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { getBnbGuestTopics, resolveBnbGuide } from '../content/bnbGuides'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const guide = computed(() => (slug.value ? resolveBnbGuide(slug.value) : null))
const topics = computed(() => (guide.value ? getBnbGuestTopics(guide.value) : []))
const currentSectionId = computed(() => String(route.params.sectionId || ''))
</script>
