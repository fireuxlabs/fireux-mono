<template>
  <main class="min-h-screen bg-zinc-50 text-zinc-950">
    <section class="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <div class="mb-8 border-b border-zinc-300/70" />

      <div class="mb-8 flex justify-end gap-2">
        <NuxtLink
          :to="originalLanguageTo"
          class="rounded-full border px-3 py-1 text-sm font-medium"
          :class="!selectedLanguage
            ? 'border-zinc-950 bg-zinc-950 text-white'
            : 'border-zinc-300 bg-white text-zinc-700'"
        >
          {{ chromeLabels.original }}
        </NuxtLink>
        <NuxtLink
          :to="germanLanguageTo"
          class="rounded-full border px-3 py-1 text-sm font-medium"
          :class="selectedLanguage === 'de'
            ? 'border-zinc-950 bg-zinc-950 text-white'
            : 'border-zinc-300 bg-white text-zinc-700'"
        >
          {{ chromeLabels.german }}
        </NuxtLink>
        <NuxtLink
          :to="englishLanguageTo"
          class="rounded-full border px-3 py-1 text-sm font-medium"
          :class="selectedLanguage === 'en'
            ? 'border-zinc-950 bg-zinc-950 text-white'
            : 'border-zinc-300 bg-white text-zinc-700'"
        >
          {{ chromeLabels.english }}
        </NuxtLink>
      </div>

      <div v-if="loading" class="py-12 text-sm text-zinc-600">
        {{ chromeLabels.loadingMenu }}
      </div>

      <div v-else-if="!resolvedKitchen" class="py-12">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.kitchenNotFound }}
        </h2>
      </div>

      <div v-else-if="!selectedMenu" class="py-12">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.menuNotFound }}
        </h2>
      </div>

      <div v-else-if="!publicSections.length" class="py-12">
        <h2 class="text-xl font-semibold">
          {{ chromeLabels.noSectionsFound }}
        </h2>
      </div>

      <div v-else class="space-y-12">
        <section
          v-for="section in publicSections"
          :key="section.id"
          class="space-y-5"
        >
          <div class="border-b border-zinc-300 pb-2">
            <h2 class="text-[1.35rem] font-semibold uppercase text-zinc-900">
              {{ section.label }}
            </h2>
            <p v-if="section.description" class="mt-1 text-sm text-zinc-600">
              {{ section.description }}
            </p>
          </div>

          <article
            v-for="entry in section.entries"
            :key="entry.id || entry.dishId"
            class="py-2"
          >
            <h3 class="text-base font-semibold leading-snug text-zinc-950">
              {{ entry.name }}
            </h3>
            <p v-if="entry.description" class="mt-1 text-[0.97rem] leading-relaxed text-zinc-700">
              {{ entry.description }}
            </p>
          </article>
        </section>
      </div>

      <DevJson
        v-if="debugData !== undefined"
        class="mt-10"
        :title="chromeLabels.menuJson"
        context="/kitchens/[slug]/menus/[menuId] · raw default menu read"
        :data="debugData"
        :default-open="true"
        :hide-when-empty="false"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, unref, type Ref } from 'vue'
import { useRoute } from '#imports'
import {
  getPublicKitchenChromeLabels,
  resolvePublicKitchenChromeLanguage,
} from '../../../composables/fireux/app/public-kitchen-language'

type MaybeRef<T> = T | Ref<T>

type MenuPreviewEntry = {
  id: string
  dishId: string
  name: string
  description: string
}

type MenuPreviewSection = {
  id: string
  label: string
  description: string
  entries: MenuPreviewEntry[]
}

type MenuPreviewState = {
  loading: MaybeRef<boolean>
  resolvedKitchen: MaybeRef<Record<string, any> | null>
  selectedMenu: MaybeRef<Record<string, any> | null>
  publicSections: MaybeRef<MenuPreviewSection[]>
  selectedLanguage?: MaybeRef<string>
  primaryLanguage?: MaybeRef<string>
  routePath?: MaybeRef<string>
  debugData?: MaybeRef<unknown>
}

const props = defineProps<{
  menu: MenuPreviewState
}>()

const route = useRoute()
const loading = computed(() => Boolean(unref(props.menu.loading)))
const resolvedKitchen = computed(() => unref(props.menu.resolvedKitchen))
const selectedMenu = computed(() => unref(props.menu.selectedMenu))
const publicSections = computed(() => unref(props.menu.publicSections) || [])
const selectedLanguage = computed(() => unref(props.menu.selectedLanguage) || '')
const primaryLanguage = computed(() => unref(props.menu.primaryLanguage) || '')
const routePath = computed(() => unref(props.menu.routePath) || route.path)
const passThroughQuery = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['lang', 'language'].includes(key)
    )
  )
)
const originalLanguageTo = computed(() => ({
  path: routePath.value,
  query: passThroughQuery.value,
}))
const germanLanguageTo = computed(() => ({
  path: routePath.value,
  query: { ...passThroughQuery.value, lang: 'de' },
}))
const englishLanguageTo = computed(() => ({
  path: routePath.value,
  query: { ...passThroughQuery.value, lang: 'en' },
}))
const chromeLanguage = computed(() =>
  resolvePublicKitchenChromeLanguage({
    selectedLanguage: selectedLanguage.value,
    primaryLanguage: primaryLanguage.value,
  })
)
const chromeLabels = computed(() => getPublicKitchenChromeLabels(chromeLanguage.value))
const debugData = computed(() => unref(props.menu.debugData))
</script>
