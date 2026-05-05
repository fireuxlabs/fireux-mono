<template>
  <main
    v-if="menu"
    class="min-h-screen bg-[#fffaf3] text-stone-950"
    :dir="activeLanguage.dir ?? 'ltr'"
  >
    <section class="border-b border-stone-200 bg-[#f6efe3]">
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-red-800">
              Misebox Menus
            </p>
            <h1 class="mt-2 text-3xl font-semibold tracking-normal text-stone-950">
              {{ menu.restaurantName }}
            </h1>
            <p class="mt-1 text-sm text-stone-600">
              {{ menu.location }} · Digital multilingual menu
            </p>
          </div>

          <div class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-right shadow-sm">
            <p class="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
              QR Menu
            </p>
            <p class="text-sm font-semibold text-stone-950">
              CHF
            </p>
          </div>
        </div>

        <nav class="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Menu language">
          <NuxtLink
            v-for="language in menu.languages"
            :key="language.code"
            :to="{ path: route.path, query: { lang: language.code } }"
            class="flex min-h-14 items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition"
            :class="language.code === selectedLanguageCode
              ? 'border-red-800 bg-red-800 text-white shadow-sm'
              : 'border-stone-300 bg-white text-stone-800 hover:border-red-800 hover:text-red-900'"
          >
            <span>
              <span class="block font-semibold">{{ language.nativeLabel }}</span>
              <span class="block text-xs opacity-75">{{ language.label }}</span>
            </span>
            <span class="rounded border border-current/25 px-1.5 py-0.5 text-[0.65rem] font-semibold">
              {{ language.shortLabel }}
            </span>
          </NuxtLink>
        </nav>
      </div>
    </section>

    <section class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div class="mb-5 flex flex-wrap items-center gap-2 text-xs text-stone-600">
        <span class="rounded-lg border border-stone-300 bg-white px-2 py-1">Approved translations</span>
        <span class="rounded-lg border border-stone-300 bg-white px-2 py-1">Allergens visible</span>
        <span class="rounded-lg border border-stone-300 bg-white px-2 py-1">No live AI on guest pages</span>
      </div>

      <div class="space-y-8">
        <section
          v-for="section in orderedSections"
          :key="section.id"
          class="scroll-mt-6"
        >
          <div class="mb-3">
            <h2 class="text-xl font-semibold text-stone-950">
              {{ sectionTitle(section) }}
            </h2>
            <p v-if="sectionDescription(section)" class="mt-1 text-sm text-stone-600">
              {{ sectionDescription(section) }}
            </p>
          </div>

          <div class="divide-y divide-stone-200 border-y border-stone-200 bg-white">
            <article
              v-for="item in itemsForSection(section.id)"
              :key="item.id"
              class="grid gap-3 px-0 py-4 sm:grid-cols-[1fr_auto]"
            >
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base font-semibold text-stone-950">
                    {{ itemName(item) }}
                  </h3>
                  <span
                    v-if="item.isSpicy"
                    class="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[0.68rem] font-semibold text-red-800"
                  >
                    {{ menuLabels.spicy }}
                  </span>
                  <span
                    v-if="item.isVegetarian"
                    class="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[0.68rem] font-semibold text-emerald-800"
                  >
                    {{ menuLabels.vegetarian }}
                  </span>
                  <span
                    v-if="item.isVegan"
                    class="rounded border border-lime-200 bg-lime-50 px-1.5 py-0.5 text-[0.68rem] font-semibold text-lime-800"
                  >
                    {{ menuLabels.vegan }}
                  </span>
                </div>
                <p v-if="itemDescription(item)" class="mt-1 text-sm leading-6 text-stone-600">
                  {{ itemDescription(item) }}
                </p>
                <div class="mt-2 flex flex-wrap gap-1.5 text-[0.68rem] font-medium text-stone-500">
                  <span
                    v-for="allergen in allergensForItem(item)"
                    :key="`${item.id}-${allergen}`"
                    class="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5"
                  >
                    {{ allergen }}
                  </span>
                </div>
              </div>

              <p class="text-base font-semibold text-stone-950 sm:text-right">
                {{ formatPrice(item.price) }}
              </p>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>

  <main v-else class="grid min-h-screen place-items-center bg-stone-950 px-4 text-white">
    <div class="max-w-md text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
        Misebox Menus
      </p>
      <h1 class="mt-3 text-3xl font-semibold">
        Menu not found
      </h1>
      <p class="mt-2 text-sm text-stone-300">
        This restaurant menu is not published yet.
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  getPublicMenu,
  menuLanguageFallback,
  type MenuLanguageCode,
  type PublicMenuItem,
  type PublicMenuSection,
} from '../../content/publicMenus'

definePageMeta({
  layout: false,
})

const route = useRoute()
const restaurant = computed(() => String(route.params.restaurant ?? ''))
const menu = computed(() => getPublicMenu(restaurant.value))

const selectedLanguageCode = computed<MenuLanguageCode>(() => {
  const requested = String(route.query.lang ?? '')
  const supported = menu.value?.languages.some((language) => language.code === requested)

  return supported ? requested as MenuLanguageCode : menuLanguageFallback
})

const activeLanguage = computed(() => {
  return menu.value?.languages.find((language) => language.code === selectedLanguageCode.value)
    ?? menu.value?.languages[0]
    ?? {
      code: menuLanguageFallback,
      label: 'English',
      shortLabel: 'EN',
      nativeLabel: 'English',
      dir: 'ltr' as const,
    }
})

const orderedSections = computed(() => {
  return [...(menu.value?.sections ?? [])].sort((a, b) => a.order - b.order)
})

const localizedLabels: Record<MenuLanguageCode, {
  spicy: string
  vegetarian: string
  vegan: string
  gluten: string
  dairy: string
  nuts: string
}> = {
  de: {
    spicy: 'Scharf',
    vegetarian: 'Vegetarisch',
    vegan: 'Vegan',
    gluten: 'Gluten',
    dairy: 'Milch',
    nuts: 'Nüsse',
  },
  en: {
    spicy: 'Spicy',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    gluten: 'Gluten',
    dairy: 'Dairy',
    nuts: 'Nuts',
  },
  gsw: {
    spicy: 'Scharf',
    vegetarian: 'Vegetarisch',
    vegan: 'Vegan',
    gluten: 'Gluten',
    dairy: 'Milch',
    nuts: 'Nüss',
  },
  hi: {
    spicy: 'तीखा',
    vegetarian: 'शाकाहारी',
    vegan: 'वीगन',
    gluten: 'ग्लूटेन',
    dairy: 'डेयरी',
    nuts: 'नट्स',
  },
  ar: {
    spicy: 'حار',
    vegetarian: 'نباتي',
    vegan: 'نباتي صرف',
    gluten: 'غلوتين',
    dairy: 'ألبان',
    nuts: 'مكسرات',
  },
  ko: {
    spicy: '매움',
    vegetarian: '채식',
    vegan: '비건',
    gluten: '글루텐',
    dairy: '유제품',
    nuts: '견과류',
  },
}

const menuLabels = computed(() => localizedLabels[selectedLanguageCode.value])

function translated(
  translations: PublicMenuSection['translations'] | PublicMenuItem['translations'],
  field: keyof NonNullable<PublicMenuSection['translations'][MenuLanguageCode]>,
) {
  return translations[selectedLanguageCode.value]?.[field]
    ?? translations[menuLanguageFallback]?.[field]
    ?? translations.de?.[field]
    ?? ''
}

function sectionTitle(section: PublicMenuSection) {
  return translated(section.translations, 'title')
}

function sectionDescription(section: PublicMenuSection) {
  return translated(section.translations, 'description')
}

function itemName(item: PublicMenuItem) {
  return translated(item.translations, 'name')
}

function itemDescription(item: PublicMenuItem) {
  return translated(item.translations, 'description')
}

function itemsForSection(sectionId: string) {
  return (menu.value?.items ?? []).filter((item) => item.sectionId === sectionId && item.isAvailable)
}

function allergensForItem(item: PublicMenuItem) {
  return [
    item.containsGluten ? menuLabels.value.gluten : '',
    item.containsDairy ? menuLabels.value.dairy : '',
    item.containsNuts ? menuLabels.value.nuts : '',
  ].filter(Boolean)
}

function formatPrice(price?: number) {
  if (price === undefined) {
    return ''
  }

  return `CHF ${price.toFixed(0)}`
}

useSeoMeta({
  title: () => menu.value
    ? `${menu.value.restaurantName} menu - Misebox Menus`
    : 'Menu not found - Misebox Menus',
  description: () => menu.value
    ? `Scan the ${menu.value.restaurantName} QR menu in Deutsch, English, Bärndütsch, Hindi, Arabic, and Korean.`
    : 'This Misebox menu is not published yet.',
})
</script>
