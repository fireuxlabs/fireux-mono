<template>
  <main class="min-h-screen bg-[#fbfaf7] text-[#17201a]">
    <section class="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-10 sm:px-8">
      <header class="pb-8">
        <h1 class="text-4xl font-semibold leading-tight sm:text-5xl">
          {{ menuTitle }}
        </h1>
        <p class="mt-2 text-base text-[#526157]">Menu</p>
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

      <div v-else class="space-y-10 pb-10">
        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="space-y-3"
        >
          <h2 class="border-b border-[#cfdacf] pb-2 text-2xl font-semibold">
            {{ section.label }}
          </h2>

          <article
            v-for="entry in section.entries"
            :key="entry.dish_id"
            class="py-3"
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

      <section
        v-if="prototypeMenu"
        class="space-y-8 border-t border-[#cfdacf] py-8"
      >
        <header>
          <h2 class="text-xl font-semibold">Semantic system map</h2>
          <p class="mt-1 text-sm text-[#526157]">
            Seed-backed data currently powering this public prototype.
          </p>
        </header>

        <section class="space-y-3">
          <h3 class="text-base font-semibold">Ingredients</h3>
          <ul class="space-y-1 text-sm text-[#36473b]">
            <li
              v-for="ingredient in ingredients"
              :key="ingredient.id"
            >
              <span class="font-medium text-[#17201a]">
                {{ sourceName(ingredient) }}
              </span>
              <span class="text-[#6b776e]"> · {{ ingredient.id }}</span>
            </li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3 class="text-base font-semibold">Recipes / Prep</h3>
          <ul class="space-y-1 text-sm text-[#36473b]">
            <li
              v-for="recipe in recipes"
              :key="recipe.id"
            >
              <span class="font-medium text-[#17201a]">{{ recipe.name }}</span>
              <span class="text-[#6b776e]"> · {{ recipe.id }}</span>
            </li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3 class="text-base font-semibold">Dishes</h3>
          <ul class="space-y-3 text-sm text-[#36473b]">
            <li
              v-for="dish in dishes"
              :key="dish.id"
            >
              <div>
                <span class="font-medium text-[#17201a]">{{ dish.name }}</span>
                <span class="text-[#6b776e]"> · {{ dish.id }}</span>
              </div>
              <div v-if="dish.recipe_ids.length" class="mt-1">
                Recipes: {{ dish.recipe_ids.join(', ') }}
              </div>
              <div v-if="dish.ingredient_ids.length" class="mt-1">
                Ingredients: {{ dish.ingredient_ids.join(', ') }}
              </div>
              <p v-if="dish.integrity_note" class="mt-1 text-[#b2362f]">
                {{ dish.integrity_note }}
              </p>
            </li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3 class="text-base font-semibold">Menu Sections</h3>
          <ul class="space-y-2 text-sm text-[#36473b]">
            <li
              v-for="section in sections"
              :key="section.id"
            >
              <span class="font-medium text-[#17201a]">{{ section.label }}</span>
              <span class="text-[#6b776e]"> · {{ section.id }}</span>
              <span>
                · {{ section.entries.length }}
                {{ section.entries.length === 1 ? 'dish' : 'dishes' }}
              </span>
              <span v-if="section.render_excluded_ids.length">
                · excludes {{ section.render_excluded_ids.join(', ') }}
              </span>
            </li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3 class="text-base font-semibold">Menu JSON</h3>
          <p class="text-sm text-[#526157]">
            The full menu payload is available in the collapsed DevJson panel below.
          </p>
        </section>
      </section>

      <DevJson
        class="mb-8"
        title="Luna prototype menu JSON"
        context="/kitchen/[slug]/menu · route first prototype"
        :data="prototypeMenu"
        :default-open="false"
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
  render_excluded_ids?: string[]
  entries: PrototypeMenuEntry[]
}

type PrototypeSource = {
  id: string
  name?: string
  names?: Record<string, string>
  recipe_ids?: string[]
  ingredient_ids?: string[]
  integrity_note?: string
}

type PrototypeMenu = {
  kitchen?: {
    display_name?: string
    name?: string
  }
  sections?: PrototypeMenuSection[]
  ingredients?: PrototypeSource[]
  recipes?: PrototypeSource[]
  dishes?: PrototypeSource[]
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
const visibleSections = computed(() =>
  sections.value.filter((section) => section.entries.length > 0)
)
const ingredients = computed(() => prototypeMenu.value?.ingredients || [])
const recipes = computed(() => prototypeMenu.value?.recipes || [])
const dishes = computed(() =>
  (prototypeMenu.value?.dishes || []).map((dish) => ({
    ...dish,
    recipe_ids: dish.recipe_ids || [],
    ingredient_ids: dish.ingredient_ids || [],
  }))
)
const sourceName = (source: PrototypeSource) =>
  source.names?.en || source.name || source.id
</script>
