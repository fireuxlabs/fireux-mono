<template>
  <main class="min-h-screen bg-[#fbfaf7] text-[#17201a]">
    <section class="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-10 sm:px-8">
      <header class="pb-8">
        <h1 class="text-4xl font-semibold leading-tight sm:text-5xl">
          {{ menuTitle }}
        </h1>
        <div class="mt-3 flex items-center justify-between gap-4">
          <p class="text-base text-[#526157]">Menu</p>
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center border border-[#9fb09f] px-3 text-sm font-medium text-[#17201a]"
            :disabled="!visibleSections.length"
            @click="copyMenu"
          >
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
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
          class="space-y-4"
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
            <p class="mt-2 text-sm text-[#36473b]">
              <span class="font-medium text-[#17201a]">Mise:</span>
              {{ formatNames(entry.mise_names) }}
            </p>
            <p class="mt-1 text-sm text-[#36473b]">
              <span class="font-medium text-[#17201a]">Ingredients:</span>
              {{ formatNames(entry.ingredient_names) }}
            </p>
            <p v-if="entry.integrity_note" class="mt-2 text-sm text-[#b2362f]">
              {{ entry.integrity_note }}
            </p>
            <p v-if="missingLabel(entry)" class="mt-1 text-sm text-[#b2362f]">
              Missing: {{ missingLabel(entry) }}
            </p>
          </article>
        </section>
      </div>

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
import { computed, ref } from 'vue'

type PrototypeMenuEntry = {
  id: string
  dish_id: string
  name: string
  semantic_line: string
  mise_names?: string[]
  ingredient_names?: string[]
  missing_mise_ids?: string[]
  missing_ingredient_ids?: string[]
  integrity_note?: string
}

type PrototypeMenuSection = {
  id: string
  label: string
  render_excluded_ids?: string[]
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
const visibleSections = computed(() =>
  sections.value.filter((section) => section.entries.length > 0)
)
const formatNames = (names?: string[]) =>
  Array.isArray(names) && names.length ? names.join(', ') : '—'
const missingLabel = (entry: PrototypeMenuEntry) => {
  const missing = [
    ...(entry.missing_mise_ids || []).map((id) => `mise:${id}`),
    ...(entry.missing_ingredient_ids || []).map((id) => `ingredient:${id}`),
  ]

  return missing.join(', ')
}
const copyText = computed(() => {
  const lines = [menuTitle.value, '']

  for (const section of visibleSections.value) {
    lines.push(section.label)
    for (const entry of section.entries) {
      lines.push(entry.name)
      lines.push(`Mise: ${formatNames(entry.mise_names)}`)
      lines.push(`Ingredients: ${formatNames(entry.ingredient_names)}`)
      if (entry.integrity_note) lines.push(`Integrity: ${entry.integrity_note}`)
      const missing = missingLabel(entry)
      if (missing) lines.push(`Missing: ${missing}`)
      lines.push('')
    }
  }

  return lines.join('\n').trim()
})
const copied = ref(false)

async function copyMenu() {
  if (!copyText.value) return

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(copyText.value)
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = copyText.value
    textArea.setAttribute('readonly', 'true')
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    textArea.remove()
  }

  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>
