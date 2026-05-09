<template>
  <main class="min-h-screen bg-[#f8faf7] text-[#17201a]">
    <section class="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8">
      <header class="border-b border-[#cfdacf] pb-6">
        <p class="text-xs font-semibold uppercase text-[#b2362f]">
          Public prototype menu
        </p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          {{ menuTitle }}
        </h1>
      </header>

      <div v-if="pending" class="py-12 text-sm text-[#526157]">
        Loading menu...
      </div>

      <div v-else-if="error" class="py-12">
        <h2 class="text-xl font-semibold">Menu failed to load</h2>
        <p class="mt-2 text-sm text-[#526157]">
          {{ error.message }}
        </p>
      </div>

      <div v-else class="space-y-10 py-8">
        <section
          v-for="section in sections"
          :key="section.id"
          class="space-y-4"
        >
          <h2 class="text-2xl font-semibold">{{ section.label }}</h2>

          <article
            v-for="entry in section.entries"
            :key="entry.dish_id"
            class="border-t border-[#cfdacf] py-4"
          >
            <h3 class="text-lg font-semibold">{{ entry.name }}</h3>
            <p class="mt-1 text-base text-[#36473b]">
              {{ entry.semantic_line }}
            </p>
            <p v-if="entry.integrity_note" class="mt-2 text-sm text-[#b2362f]">
              {{ entry.integrity_note }}
            </p>
          </article>
        </section>
      </div>

      <DevJson
        class="mb-8"
        title="Luna prototype menu JSON"
        context="/kitchen/[slug]/menu · route first prototype"
        :data="prototypeMenu"
        :default-open="true"
        :hide-when-empty="false"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PrototypeMenuEntry = {
  id: string
  dish_id: string
  name: string
  semantic_line: string
  integrity_note?: string
}

type PrototypeMenuSection = {
  id: string
  label: string
  entries: PrototypeMenuEntry[]
}

type PrototypeMenu = {
  kitchen?: {
    display_name?: string
    name?: string
  }
  sections?: PrototypeMenuSection[]
}

definePageMeta({
  layout: 'public-menu',
  title: 'Kitchen Menu',
  description: 'Public menu prototype view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicPrototypeMenuPage',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())
const { data: prototypeMenu, pending, error } = await useFetch<PrototypeMenu>(
  () => `/api/kitchen/${encodeURIComponent(slug.value)}/menu`
)
const menuTitle = computed(
  () =>
    prototypeMenu.value?.kitchen?.display_name ||
    prototypeMenu.value?.kitchen?.name ||
    'Luna Piccante'
)
const sections = computed(() => prototypeMenu.value?.sections || [])
</script>
