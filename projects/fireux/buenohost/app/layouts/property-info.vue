<template>
  <main class="min-h-screen bg-default text-default">
    <header class="border-b border-default bg-default">
      <UContainer class="flex items-center justify-between gap-4 py-4">
        <NuxtLink to="/" class="inline-flex items-center gap-3 text-sm font-semibold text-primary">
          <img src="/img/app/logo.png" alt="" class="size-8 rounded" />
          <span>BuenoHost</span>
        </NuxtLink>

        <UButton
          :to="property ? `/properties/${property.slug}` : '/'"
          icon="i-lucide-house"
          color="neutral"
          variant="ghost"
        >
          Property
        </UButton>
      </UContainer>
    </header>

    <UContainer
      v-if="info && property"
      class="grid min-w-0 gap-6 py-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-8"
    >
      <aside class="min-w-0 lg:pt-1">
        <nav class="lg:sticky lg:top-6" aria-label="Property info navigation">
          <div class="flex max-w-full gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
            <NuxtLink
              :to="`/properties/${property.slug}/info`"
              class="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-default"
              :class="{ 'bg-elevated font-semibold text-default': !currentSectionId }"
            >
              Welcome
            </NuxtLink>
            <NuxtLink
              v-for="section in sections"
              :key="section.id"
              :to="`/properties/${property.slug}/info/${section.id}`"
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

    <LayoutsSharedFloatingChatButton />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPropertyInfoSections, resolvePropertyInfo } from '../demo/propertyInfo'
import { findDemoBuenoHostPublicProperty } from '../demo/properties'

const route = useRoute()
const propertySlug = computed(() => String(route.params.slug || ''))
const property = computed(() => findDemoBuenoHostPublicProperty(propertySlug.value))
const info = computed(() => (property.value ? resolvePropertyInfo(property.value.slug) : null))
const sections = computed(() => (info.value ? getPropertyInfoSections(info.value) : []))
const currentSectionId = computed(() => String(route.params.infoId || ''))
</script>
