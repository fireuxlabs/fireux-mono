<template>
  <main
    class="qr-menu min-h-screen"
    :dir="activeLanguage.dir"
    :style="menuThemeStyle"
  >
    <section class="relative min-h-[68svh] overflow-hidden bg-[#21140d] text-white">
      <img
        v-if="heroImage"
        :src="heroImage"
        :alt="kitchenName"
        class="absolute inset-0 h-full w-full object-cover"
      >
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,13,8,0.1),rgba(22,13,8,0.62)_48%,rgba(22,13,8,0.94))]" />

      <div class="relative mx-auto flex min-h-[68svh] w-full max-w-3xl flex-col justify-end px-5 pb-5 pt-10 sm:px-7">
        <div class="pb-6">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-100/90">
            QR Menu
          </p>
          <h1 class="mt-3 text-5xl font-semibold leading-none tracking-normal sm:text-6xl">
            {{ kitchenName }}
          </h1>
          <p v-if="kitchenAddress" class="mt-3 text-sm leading-6 text-orange-100/85">
            {{ kitchenAddress }}
          </p>
          <p v-if="headerDescription" class="mt-3 max-w-xl text-base leading-7 text-orange-50/90">
            {{ headerDescription }}
          </p>
        </div>

        <section class="rounded-lg border border-white/15 bg-white/10 p-2.5 shadow-2xl backdrop-blur-md">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-orange-100/75">
                {{ uiLabels.chooseLanguage }}
              </p>
              <p class="text-sm font-semibold text-white">
                {{ activeLanguage.nativeLabel }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <button
                v-for="language in languages"
                :key="language.code"
                type="button"
                class="grid size-9 place-items-center rounded-full border text-lg leading-none transition"
                :class="language.code === activeLanguage.code
                  ? 'border-white bg-white text-[#21140d]'
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/20'"
                :aria-label="language.nativeLabel"
                :title="language.nativeLabel"
                @click="setGuestLanguage(language.code)"
              >
                {{ language.icon }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>

    <nav
      v-if="hasMenuItems"
      class="sticky top-0 z-20 border-b border-[#ead9c5] backdrop-blur-md"
      :style="{ backgroundColor: menuDesign.background_hex }"
    >
      <div class="mx-auto flex w-full max-w-3xl gap-2 overflow-x-auto px-5 py-3 sm:px-7">
        <a
          v-for="section in sortedSections"
          :key="section.id"
          :href="`#${sectionAnchor(section)}`"
          class="shrink-0 rounded-md border border-[#ead9c5] bg-white px-3 py-2 text-sm font-semibold text-[#4c2f1d] shadow-sm"
        >
          {{ section.label }}
        </a>
      </div>
    </nav>

    <section class="mx-auto w-full max-w-3xl px-5 py-7 sm:px-7 sm:py-10">
      <div v-if="loading" class="rounded-lg border border-[#ead9c5] bg-white p-5 text-sm text-[#684731] shadow-sm">
        {{ uiLabels.loading }}
      </div>

      <div
        v-else-if="!resolvedKitchen"
        class="rounded-lg border border-[#ead9c5] bg-white p-5 text-sm text-[#684731] shadow-sm"
      >
        {{ uiLabels.kitchenNotFound }}
      </div>

      <template v-else>
        <div class="mb-5 flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8471d]">
              {{ uiLabels.qrMenu }}
            </p>
            <h2 class="mt-1 text-3xl font-semibold tracking-normal text-[var(--qr-menu-text)]">
              {{ selectedMenu ? selectedMenu.name : uiLabels.todaysMenu }}
            </h2>
          </div>
          <span class="rounded-md border border-[#ead9c5] bg-white px-3 py-2 text-sm font-semibold text-[#4c2f1d] shadow-sm">
            {{ activeLanguage.shortLabel }}
          </span>
        </div>

        <div v-if="hasMenuItems" class="space-y-12">
          <section
            v-for="section in sortedSections"
            :id="sectionAnchor(section)"
            :key="section.id"
            class="scroll-mt-24"
          >
            <div class="mb-5 border-b border-[#ead9c5] pb-4">
              <h3 class="text-3xl font-semibold tracking-normal text-[#21140d]">
                {{ section.label }}
              </h3>
            </div>

            <div class="space-y-4">
              <article
                v-for="entry in menuEntriesForSection(section)"
                :key="entry.key"
                class="rounded-lg border border-[#ead9c5] bg-white p-4 shadow-sm"
              >
                <div class="grid grid-cols-[1fr_auto] items-start gap-4">
                  <h4 class="text-lg font-semibold leading-6 text-[var(--qr-menu-text)]">
                    {{ entry.label }}
                  </h4>
                  <p class="text-base font-semibold text-[#a8471d]">
                    {{ entry.price }}
                  </p>
                </div>
                <p v-if="entry.description" class="mt-2 text-sm leading-6 text-[#684731]">
                  {{ entry.description }}
                </p>
              </article>
            </div>
          </section>
        </div>

        <section
          v-else
          class="overflow-hidden rounded-lg border border-[#ead9c5] bg-white shadow-sm"
        >
          <div class="p-6 sm:p-8">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8471d]">
              {{ uiLabels.preview }}
            </p>
            <h3 class="mt-2 text-3xl font-semibold tracking-normal text-[#21140d]">
              {{ uiLabels.menuComingSoon }}
            </h3>
            <p class="mt-3 max-w-xl text-base leading-7 text-[#684731]">
              {{ uiLabels.preparingMenu }}
            </p>
            <div class="mt-6 rounded-md border border-[#ead9c5] bg-[#fff7ed] p-4 text-sm">
              <p class="font-semibold text-[var(--qr-menu-text)]">{{ uiLabels.address }}</p>
              <p class="mt-1 leading-6 text-[#684731]">
                {{ kitchenAddress || uiLabels.addressComingSoon }}
              </p>
            </div>
          </div>
        </section>

        <div class="mt-8 rounded-lg border border-[#ead9c5] bg-white p-4 shadow-sm">
          <p class="text-sm leading-6 text-[#5d4030]">
            {{ uiLabels.allergyNotice }}
          </p>
        </div>
      </template>
    </section>

    <footer class="border-t border-[#ead9c5] px-5 py-6 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#8b654b]">
      <div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-2">
        <span>Powered by</span>
        <div class="flex items-center gap-2">
          <AppBrandLogo
            size="small"
            alt="Misebox logo"
            class="!h-6 !w-6"
          />
          <AppBrandWordmark
            size="small"
            alt="Misebox"
            class="!h-5"
          />
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from '#imports'
import type { KitchenMenuState } from '../../../composables/fireux/app/useKitchenMenu'

type KitchenQRMenuState = Pick<
  KitchenMenuState,
  | 'formatPrice'
  | 'headerDescription'
  | 'headerTitle'
  | 'kitchenAddress'
  | 'loading'
  | 'menuDesign'
  | 'resolvedKitchen'
  | 'selectedMenu'
  | 'sortedSections'
>

const props = defineProps<{
  menu: KitchenQRMenuState
}>()

type MenuLanguageCode = 'de' | 'en' | 'gsw' | 'ar' | 'ko' | 'hi'

type MenuLanguage = {
  code: MenuLanguageCode
  icon: string
  nativeLabel: string
  shortLabel: string
  dir: 'ltr' | 'rtl'
}

type MenuEntry = {
  key: string
  label: string
  description: string
  price: string
}

type MenuSectionViewLike = {
  id: string
  label: string
  itemGroups?: Array<{
    key: string
    label: string
    items?: Array<{
      id: string
      label?: string
      description?: string
      price?: number
      names?: Record<string, string>
      descriptions?: Record<string, string>
    }>
  }>
}

const route = useRoute()
const guestLanguageCode = ref<MenuLanguageCode>('de')
const guestLanguageStorageKey = 'misebox-public-menu-language'

const languages: MenuLanguage[] = [
  { code: 'de', icon: '🇩🇪', nativeLabel: 'Deutsch', shortLabel: 'DE', dir: 'ltr' },
  { code: 'en', icon: '🇬🇧', nativeLabel: 'English', shortLabel: 'EN', dir: 'ltr' },
  { code: 'gsw', icon: '🇨🇭', nativeLabel: 'Baernduetsch', shortLabel: 'CH', dir: 'ltr' },
  { code: 'ar', icon: '🇸🇦', nativeLabel: 'العربية', shortLabel: 'AR', dir: 'rtl' },
  { code: 'ko', icon: '🇰🇷', nativeLabel: '한국어', shortLabel: 'KO', dir: 'ltr' },
  { code: 'hi', icon: '🇮🇳', nativeLabel: 'हिन्दी', shortLabel: 'HI', dir: 'ltr' },
]

const languageCodes = new Set<MenuLanguageCode>(languages.map((language) => language.code))

const activeLanguage = computed<MenuLanguage>(() => {
  return languages.find((language) => language.code === guestLanguageCode.value) || languages[0]
})

onMounted(() => {
  const raw = route.query.lang
  const requested = (Array.isArray(raw) ? raw[0] : raw) as MenuLanguageCode | undefined
  const saved = window.localStorage.getItem(guestLanguageStorageKey) as MenuLanguageCode | null
  const detected = String(navigator.language || '').split('-')[0].toLowerCase() as MenuLanguageCode

  if (requested && languageCodes.has(requested)) {
    guestLanguageCode.value = requested
    return
  }

  if (saved && languageCodes.has(saved)) {
    guestLanguageCode.value = saved
    return
  }

  if (languageCodes.has(detected)) {
    guestLanguageCode.value = detected
  }
})

function setGuestLanguage(code: MenuLanguageCode) {
  if (!languageCodes.has(code)) return
  guestLanguageCode.value = code
  window.localStorage.setItem(guestLanguageStorageKey, code)
}

const uiCopy: Record<MenuLanguageCode, {
  chooseLanguage: string
  qrMenu: string
  todaysMenu: string
  preview: string
  menuComingSoon: string
  preparingMenu: string
  address: string
  addressComingSoon: string
  allergyNotice: string
  loading: string
  kitchenNotFound: string
  section: string
}> = {
  de: {
    chooseLanguage: 'Sprache waehlen',
    qrMenu: 'QR Menu',
    todaysMenu: 'Heutiges Menue',
    preview: 'Vorschau',
    menuComingSoon: 'Menue kommt bald',
    preparingMenu: 'Wir bereiten das digitale Menue vor.',
    address: 'Adresse',
    addressComingSoon: 'Adresse folgt',
    allergyNotice: 'Wenn Sie eine Allergie oder Unvertraeglichkeit haben, sprechen Sie bitte vor der Bestellung mit unserem Team.',
    loading: 'Menue wird geladen...',
    kitchenNotFound: 'Dieses Restaurant konnte nicht gefunden werden.',
    section: 'Bereich',
  },
  en: {
    chooseLanguage: 'Choose language',
    qrMenu: 'QR Menu',
    todaysMenu: "Today's Menu",
    preview: 'Preview',
    menuComingSoon: 'Menu coming soon',
    preparingMenu: 'We are preparing the digital menu.',
    address: 'Address',
    addressComingSoon: 'Address coming soon',
    allergyNotice: 'If you have an allergy or intolerance, please speak to a member of staff before ordering.',
    loading: 'Loading menu...',
    kitchenNotFound: 'This restaurant could not be found.',
    section: 'Section',
  },
  gsw: {
    chooseLanguage: 'Sprach waehle',
    qrMenu: 'QR Menu',
    todaysMenu: 'Huetigs Menue',
    preview: 'Vorschau',
    menuComingSoon: 'Menue chunnt glii',
    preparingMenu: 'Mir bereite s digitale Menue vor.',
    address: 'Adresse',
    addressComingSoon: 'Adresse chunnt glii',
    allergyNotice: 'Wenn du e Allergie oder Unvertraeglichkeit hesch, sprich bitte vor em Bstelle mit oisem Team.',
    loading: 'Menue ladet...',
    kitchenNotFound: 'Das Restaurant isch nid gfunde worde.',
    section: 'Bereich',
  },
  ar: {
    chooseLanguage: 'اختر اللغة',
    qrMenu: 'قائمة QR',
    todaysMenu: 'قائمة اليوم',
    preview: 'معاينة',
    menuComingSoon: 'القائمة قريباً',
    preparingMenu: 'نحن نجهز القائمة الرقمية.',
    address: 'العنوان',
    addressComingSoon: 'العنوان قريباً',
    allergyNotice: 'إذا كانت لديك حساسية أو عدم تحمل لأي مكون، يرجى التحدث إلى أحد أفراد الفريق قبل الطلب.',
    loading: 'جار تحميل القائمة...',
    kitchenNotFound: 'تعذر العثور على هذا المطعم.',
    section: 'قسم',
  },
  ko: {
    chooseLanguage: '언어 선택',
    qrMenu: 'QR 메뉴',
    todaysMenu: '오늘의 메뉴',
    preview: '미리보기',
    menuComingSoon: '메뉴 준비 중',
    preparingMenu: '디지털 메뉴를 준비하고 있습니다.',
    address: '주소',
    addressComingSoon: '주소 준비 중',
    allergyNotice: '알레르기나 음식 불내증이 있으시면 주문 전 직원에게 말씀해 주세요.',
    loading: '메뉴를 불러오는 중...',
    kitchenNotFound: '이 레스토랑을 찾을 수 없습니다.',
    section: '섹션',
  },
  hi: {
    chooseLanguage: 'भाषा चुनें',
    qrMenu: 'QR मेनू',
    todaysMenu: 'आज का मेनू',
    preview: 'पूर्वावलोकन',
    menuComingSoon: 'मेनू जल्द आ रहा है',
    preparingMenu: 'हम डिजिटल मेनू तैयार कर रहे हैं।',
    address: 'पता',
    addressComingSoon: 'पता जल्द आएगा',
    allergyNotice: 'यदि आपको कोई एलर्जी या असहिष्णुता है, तो ऑर्डर करने से पहले कृपया स्टाफ से बात करें।',
    loading: 'मेनू लोड हो रहा है...',
    kitchenNotFound: 'यह रेस्टोरेंट नहीं मिला।',
    section: 'सेक्शन',
  },
}

const uiLabels = computed(() => uiCopy[activeLanguage.value.code])

const {
  formatPrice,
  headerDescription,
  headerTitle,
  kitchenAddress,
  loading,
  menuDesign,
  resolvedKitchen,
  selectedMenu,
  sortedSections,
} = props.menu

const menuThemeStyle = computed<Record<string, string>>(() => ({
  '--qr-menu-bg': menuDesign.value.background_hex,
  '--qr-menu-text': menuDesign.value.text_hex,
}))

const kitchenName = computed(() =>
  String(resolvedKitchen.value?.name || headerTitle.value || 'Restaurant')
)

const heroImage = computed(() =>
  String((resolvedKitchen.value as Record<string, unknown> | null)?.image_url || '')
)

const hasMenuItems = computed(() =>
  sortedSections.value.some((section) => menuEntriesForSection(section).length > 0)
)

function sectionAnchor(section: { id: string }) {
  return String(section.id)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function menuEntriesForSection(section: MenuSectionViewLike): MenuEntry[] {
  return (section.itemGroups || []).flatMap((group) => {
    const items = group.items || []
    return items.map((item) => ({
      key: `${group.key}-${item.id}`,
      label: items.length > 1
        ? `${group.label} ${item.label}`.trim()
        : resolveLocalizedMenuText(item.names, item.label ?? ''),
      description: resolveLocalizedMenuText(item.descriptions, item.description || ''),
      price: formatPrice(item.price),
    }))
  })
}

function resolveLocalizedMenuText(
  translations: Record<string, string> | undefined,
  fallback: string
) {
  if (!translations) return fallback

  const code = activeLanguage.value.code
  return (
    translations[code] ||
    translations.de ||
    translations.en ||
    translations.it ||
    translations.fr ||
    Object.values(translations)[0] ||
    fallback
  )
}
</script>

<style scoped>
.qr-menu {
  background: var(--qr-menu-bg);
  color: var(--qr-menu-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.qr-menu[dir='rtl'] {
  text-align: right;
}
</style>
