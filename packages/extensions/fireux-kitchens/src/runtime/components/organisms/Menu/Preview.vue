<template>
  <main class="min-h-screen bg-[#f8faf7] text-[#17201a]">
    <section class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
      <NuxtLink
        :to="menu.backToKitchen"
        class="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#2f6b45]"
      >
        <span aria-hidden="true">&larr;</span>
        Kitchen
      </NuxtLink>

      <header class="border-b border-[#cfdacf] pb-6">
        <p class="text-xs font-semibold uppercase text-[#b2362f]">
          Luna Piccante
        </p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          {{ title }}
        </h1>
        <p v-if="menu.kitchenAddress" class="mt-3 text-sm text-[#526157]">
          {{ menu.kitchenAddress }}
        </p>
      </header>

      <div v-if="menu.loading" class="py-12 text-sm text-[#526157]">
        Loading menu...
      </div>

      <div v-else-if="!menu.resolvedKitchen" class="py-12">
        <h2 class="text-xl font-semibold">Kitchen not found</h2>
        <p class="mt-2 text-sm text-[#526157]">
          The kitchen slug does not match a published kitchen.
        </p>
      </div>

      <div v-else-if="!menu.selectedMenu" class="py-12">
        <h2 class="text-xl font-semibold">Menu not found</h2>
        <p class="mt-2 text-sm text-[#526157]">
          This kitchen does not have a public prototype menu yet.
        </p>
      </div>

      <div v-else-if="!menu.semanticSections.length" class="py-12">
        <h2 class="text-xl font-semibold">No menu sections</h2>
        <p class="mt-2 text-sm text-[#526157]">
          The selected public menu has no semantic dish sections yet.
        </p>
      </div>

      <div v-else class="space-y-10 py-8">
        <section
          v-for="section in menu.semanticSections"
          :key="section.id"
          class="space-y-4"
        >
          <div>
            <h2 class="text-2xl font-semibold">{{ section.label }}</h2>
            <p v-if="section.description" class="mt-1 text-sm text-[#526157]">
              {{ section.description }}
            </p>
          </div>

          <article
            v-for="entry in section.entries"
            :key="entry.dishId"
            class="border-t border-[#cfdacf] py-4"
          >
            <h3 class="text-lg font-semibold">{{ entry.name }}</h3>
            <p v-if="entry.semanticLine" class="mt-1 text-base text-[#36473b]">
              {{ entry.semanticLine }}
            </p>
            <p v-if="entry.integrityNote" class="mt-2 text-sm text-[#b2362f]">
              {{ entry.integrityNote }}
            </p>
          </article>
        </section>
      </div>

      <DevJson
        v-if="showDebugJson"
        class="mb-8"
        title="Luna prototype menu JSON"
        context="/kitchen/[slug]/menu · semantic menu proof"
        :data="menu.prototypeMenuJson"
        :default-open="true"
        :hide-when-empty="false"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenMenuState } from '../../../composables/fireux/app/useKitchenMenu'

type MenuPreviewState = Pick<
  KitchenMenuState,
  | 'backToKitchen'
  | 'headerTitle'
  | 'kitchenAddress'
  | 'loading'
  | 'resolvedKitchen'
  | 'selectedMenu'
  | 'semanticSections'
  | 'prototypeMenuJson'
>

const props = withDefaults(
  defineProps<{
    menu: MenuPreviewState
    showDebugJson?: boolean
  }>(),
  {
    showDebugJson: false,
  }
)

const title = computed(() => props.menu.headerTitle || 'Menu')
</script>
