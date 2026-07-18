<template>
  <UPage>
    <UPageBody class="space-y-16 pb-16 pt-10 sm:pt-14">
      <section>
        <div class="max-w-4xl space-y-5">
          <UBadge color="primary" variant="soft">
            Property management tools
          </UBadge>

          <div class="space-y-4">
            <h1 class="max-w-5xl text-5xl font-semibold leading-tight tracking-normal text-highlighted sm:text-6xl lg:text-7xl">
              The digital stay companion for your guests.
            </h1>
            <p class="max-w-2xl text-lg text-muted">
              Turn any room, apartment or holiday into a digital stay companion and local guide.
            </p>
          </div>
        </div>
      </section>

      <section
        class="space-y-6"
        aria-labelledby="sample-info-title"
      >
        <UCard variant="subtle">
          <div class="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-center">
            <div class="space-y-4">
              <div class="mx-auto flex max-w-sm flex-col items-center gap-2">
                <UButton
                  :to="demoInfoPath"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-qr-code"
                  class="w-full justify-center"
                >
                  View sample stay companion
                </UButton>
                <div class="text-center text-sm text-muted">
                  <div>- or -</div>
                  <div>scan below</div>
                </div>
              </div>

              <NuxtLink
                :to="demoInfoPath"
                class="mx-auto block w-full max-w-sm rounded-lg border border-default bg-white p-5 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                aria-label="Open the demo stay companion"
              >
                <div class="space-y-5 text-center">
                  <div>
                    <p class="text-sm font-medium uppercase tracking-wide text-slate-500">
                      Luxurious Mountain Chalet
                    </p>
                    <h3 class="mt-1 text-2xl font-semibold tracking-normal">
                      Everything about your stay.
                    </h3>
                  </div>

                  <div class="mx-auto w-fit rounded-lg border border-slate-200 bg-white p-3">
                    <div class="relative">
                      <img
                        v-if="qrDataUrl"
                        :src="qrDataUrl"
                        alt="QR code for the demo stay companion"
                        class="size-56"
                      >
                      <div
                        v-else
                        class="grid size-56 place-items-center text-sm text-slate-500"
                      >
                        Creating QR...
                      </div>

                      <div
                        v-if="qrDataUrl"
                        class="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                        aria-hidden="true"
                      >
                        <img
                          src="/img/app/logo.png"
                          alt=""
                          class="size-full rounded-sm object-contain"
                        >
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap justify-center gap-2">
                    <UBadge
                      v-for="item in stickerTopics"
                      :key="item"
                      color="primary"
                      variant="soft"
                    >
                      {{ item }}
                    </UBadge>
                  </div>

                </div>
              </NuxtLink>
            </div>

            <div id="upload" class="flex h-full flex-col gap-5">
              <div class="space-y-2">
                <h2 id="sample-info-title" class="text-2xl font-semibold tracking-normal text-highlighted">
                  A mobile house manual for tenants and short stays.
                </h2>
                <p class="text-muted">
                  BuenoHost organises your check-in, parking, house rules, apartment details, local recommendations, checkout and emergency information into one mobile house manual.
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="item in guestAppPreview"
                  :key="item.title"
                  class="rounded-lg border border-default bg-default p-4"
                >
                  <div class="flex items-start gap-3">
                    <UIcon :name="item.icon" class="mt-0.5 size-5 text-primary" />
                    <div>
                      <h4 class="font-medium text-highlighted">
                        {{ item.title }}
                      </h4>
                      <p class="mt-1 text-sm text-muted">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border border-default bg-muted/30 p-4">
                <ul class="grid gap-x-4 gap-y-1 text-sm text-muted sm:grid-cols-2">
                  <li
                    v-for="item in extraInfoBullets"
                    :key="item"
                    class="flex gap-2"
                  >
                    <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="mt-auto space-y-3">
                <h4 class="font-medium text-highlighted">
                  Try before you buy
                </h4>
                <p class="text-sm text-muted">
                  Upload your current welcome document. We’ll turn it into a hosted guest URL with a QR code.
                </p>
                <UButton
                  href="#upload"
                  color="primary"
                  icon="i-lucide-file-up"
                >
                  Upload your welcome document
                </UButton>
                <p class="text-xs text-muted">
                  Formats: PDF, DOCX, Pages, images, or plain text.
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section
        aria-label="Pricing"
      >
        <UPricingPlans :plans="pricingPlans" />
      </section>

      <LandingSolutions variant="preview" />

      <section
        class="space-y-6"
        aria-labelledby="companion-console-demo"
      >
        <div class="max-w-2xl space-y-2">
          <UButton
            id="companion-console-demo"
            to="/console/property"
            size="xl"
            variant="subtle"
            color="primary"
            icon="i-lucide-circle-play"
          >
            Demo the host console
          </UButton>
          <p class="text-muted">
            Open the Property console shape before data wiring is added.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <UCard
            v-for="feature in consoleFeatures"
            :key="feature.title"
            variant="subtle"
          >
            <div class="space-y-3">
              <UIcon :name="feature.icon" class="size-6 text-primary" />
              <div>
                <h3 class="font-semibold text-highlighted">
                  {{ feature.title }}
                </h3>
                <p class="mt-1 text-sm text-muted">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

      </section>

      <section
        class="space-y-6"
        aria-labelledby="integrations-title"
      >
        <div class="max-w-3xl space-y-2">
          <h2 id="integrations-title" class="text-2xl font-semibold tracking-normal text-highlighted">
            Integrations
          </h2>
          <p class="text-xl font-medium text-highlighted">
            Connect the stay to the services around it.
          </p>
          <p class="text-muted">
            BuenoHost can connect your guest information, operations and hospitality services, from calendar-based arrivals to translations, private chefs and cleaning teams.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="card in resolvedIntegrationCards"
            :key="card.title"
            :to="card.href"
            :target="isExternalUrl(card.href) ? '_blank' : undefined"
            :rel="isExternalUrl(card.href) ? 'noopener noreferrer' : undefined"
            class="group block h-full"
          >
            <UCard
              variant="subtle"
              class="h-full transition group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-sm"
            >
              <div class="flex h-full flex-col gap-4">
                <div class="flex h-12 items-center justify-between gap-3">
                  <img
                    v-if="card.brandSrc"
                    :src="card.brandSrc"
                    :alt="`${card.title} wordmark`"
                    class="max-h-9 max-w-36 object-contain"
                    loading="lazy"
                  >
                  <div
                    v-else
                    class="grid size-11 place-items-center rounded-lg bg-primary/10"
                  >
                    <UIcon :name="card.icon" class="size-6 text-primary" />
                  </div>
                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="size-4 shrink-0 text-muted transition group-hover:text-primary"
                  />
                </div>

                <div>
                  <h3 class="font-semibold text-highlighted">
                    {{ card.title }}
                  </h3>
                  <p class="mt-1 text-sm text-muted">
                    {{ card.description }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig, useSeoMeta } from '#imports'

const demoInfoPath = '/properties/demo-stay/info'
const qrTargetUrl = ref('')
const qrDataUrl = ref('')
const runtimeConfig = useRuntimeConfig()
const publicConfig = runtimeConfig.public as Record<string, unknown>
const defaultBuenoHostBaseUrl = 'https://buenohost.web.app'

type IntegrationAppKey = 'fireux' | 'misebox' | 'cleanbox' | 'sproochli' | 'findMySeo'

type PublicAppInfo = {
  app?: {
    social_links?: {
      website?: string
    }
    media?: {
      logo_url?: string
      wordmark_dark_url?: string
      wordmark_light_url?: string
    }
  }
}

type IntegrationCard = {
  title: string
  description: string
  icon: string
  href?: string
  appKey?: IntegrationAppKey
}

const defaultIntegrationBaseUrls: Record<IntegrationAppKey, string> = {
  fireux: 'https://fireux.app',
  misebox: 'https://misebox.app',
  cleanbox: 'https://cleanbox.web.app',
  sproochli: 'https://sproochli.web.app',
  findMySeo: 'https://find-my-seo.web.app',
}

const localIntegrationBaseUrls: Record<IntegrationAppKey, string> = {
  fireux: 'http://localhost:3000',
  misebox: 'http://localhost:3001',
  cleanbox: 'http://localhost:3002',
  sproochli: 'http://localhost:3011',
  findMySeo: 'http://localhost:3010',
}

const integrationAppInfo = ref<Partial<Record<IntegrationAppKey, PublicAppInfo>>>({})

const stickerTopics = [
  'Welcome',
  'Check-in',
  'Parking',
  'Checkout',
  'House rules',
  'Local recommendations',
]

const guestAppPreview = [
  {
    title: 'Welcome',
    description: 'Arrival note, Wi-Fi, host contact and first steps.',
    icon: 'i-lucide-hand-heart',
  },
  {
    title: 'Check-in & checkout',
    description: 'Access, keys, parking, arrival details and departure steps.',
    icon: 'i-lucide-key-round',
  },
  {
    title: 'Emergency',
    description: 'Urgent numbers, medical help and safety equipment.',
    icon: 'i-lucide-siren',
  },
  {
    title: 'Local Recommendations',
    description: 'Shops, transport and nearby recommendations.',
    icon: 'i-lucide-map-pin',
  },
]

const extraInfoBullets = [
  'House rules',
  'Rubbish and recycling',
  'Appliance manuals',
  'Heating and air con instructions',
  'Live updates',
  'Laundry instructions',
  'TV and streaming',
  'Balcony and outdoor notes',
]

const pricingPlans = [
  {
    id: 'buenohost',
    title: 'BuenoHost',
    description: 'Includes your first property and two room QR codes.',
    price: '£10',
    billingPeriod: '/ month',
    highlight: true,
    scale: true,
    features: [
      '1 property',
      '2 rooms (if required)',
      'AI-ready document processing',
      'Operational host console',
      'Hosted guest URL and QR tools',
    ],
    button: {
      label: 'Start with BuenoHost',
      to: '#upload',
      color: 'primary',
      variant: 'solid',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'extra-properties',
    title: 'Extra Properties',
    description: 'Add additional properties to the same BuenoHost account.',
    price: '+ £5',
    billingPeriod: '/ month',
    features: [
      'Add more properties',
      'Separate URLs and QR codes',
      'Reusable or specific manual sections',
      'Property-level stay companion',
      'Account-level overview later',
    ],
    button: {
      label: 'Add additional property',
      to: '#upload',
      color: 'neutral',
      variant: 'soft',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'room-qr-codes',
    title: 'Extra rooms',
    description: 'Add additional rooms to your properties.',
    price: '+ £2',
    billingPeriod: '/ month',
    features: [
      'Room-specific QR codes',
      'Room notes and instructions',
      'Shared property manual',
      'Different details per room',
      'Useful for guesthouses and shared stays',
    ],
    button: {
      label: 'Add additional Room',
      to: '#upload',
      color: 'neutral',
      variant: 'soft',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
] as const

const consoleFeatures = [
  {
    title: 'Out of the box',
    description: 'Start with ready-made sections for welcome, check-in, emergency and local recommendations.',
    icon: 'i-lucide-layout-list',
  },
  {
    title: 'Create your own',
    description: 'Tailor your manual with custom sections for anything your property, building or room needs.',
    icon: 'i-lucide-square-plus',
  },
  {
    title: 'Welcome',
    description: 'Set the first message guests see with arrival notes, Wi-Fi, host contact and key first steps.',
    icon: 'i-lucide-message-square-heart',
  },
  {
    title: 'Publish',
    description: 'Push new information to your QR code without reprinting the manual.',
    icon: 'i-lucide-qr-code',
  },
] as const

const integrationCards: IntegrationCard[] = [
  {
    title: 'Google Calendar',
    description: 'Use booking dates to update check-in, checkout and personalised welcome messages.',
    icon: 'i-logos-google-calendar',
    href: 'https://calendar.google.com',
  },
  {
    title: 'Sproochli',
    description: 'Translate guest information into multiple languages.',
    icon: 'i-lucide-languages',
    appKey: 'sproochli',
  },
  {
    title: 'Misebox',
    description: 'Let guests discover local private chefs and hospitality services.',
    icon: 'i-lucide-chef-hat',
    appKey: 'misebox',
  },
  {
    title: 'Find My SEO',
    description: 'Work with SEO specialists to promote your stay companion beyond booking platforms.',
    icon: 'i-lucide-search-check',
    appKey: 'findMySeo',
  },
  {
    title: 'CleanBox',
    description: 'Connect properties with trusted cleaners, turnovers and room-readiness tasks.',
    icon: 'i-lucide-spray-can',
    appKey: 'cleanbox',
  },
  {
    title: 'FireUX',
    description: 'Build a custom hosting platform or property experience with FireUX.',
    icon: 'i-lucide-flame',
    appKey: 'fireux',
  },
]

const resolvedIntegrationCards = computed(() =>
  integrationCards.map((card) => ({
    ...card,
    brandSrc: card.appKey ? resolveIntegrationBrandSrc(card.appKey) : '',
    href: resolveIntegrationHref(card),
  }))
)

function configString(key: string): string {
  const value = publicConfig[key]
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function integrationBaseUrls(appKey: IntegrationAppKey): string[] {
  const configured = configString(`${appKey}BaseUrl`)
  if (configured) return [normalizeBaseUrl(configured)]

  const urls: string[] = []

  if (import.meta.client && window.location.hostname === 'localhost') {
    urls.push(localIntegrationBaseUrls[appKey])
  }

  urls.push(defaultIntegrationBaseUrls[appKey])
  return [...new Set(urls.map(normalizeBaseUrl).filter(Boolean))]
}

function integrationInfoUrls(appKey: IntegrationAppKey): string[] {
  return integrationBaseUrls(appKey).map((baseUrl) => `${baseUrl}/api/public/app/info`)
}

function resolveIntegrationBrandSrc(appKey: IntegrationAppKey): string {
  const media = integrationAppInfo.value[appKey]?.app?.media
  return media?.wordmark_dark_url || media?.logo_url || media?.wordmark_light_url || ''
}

function resolveIntegrationHref(card: IntegrationCard): string {
  if (card.href) return card.href
  if (!card.appKey) return '#'

  return (
    integrationAppInfo.value[card.appKey]?.app?.social_links?.website ||
    defaultIntegrationBaseUrls[card.appKey] ||
    '#'
  )
}

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

async function fetchIntegrationAppInfo(appKey: IntegrationAppKey): Promise<void> {
  for (const url of integrationInfoUrls(appKey)) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })
      if (!response.ok) continue

      const data = (await response.json()) as PublicAppInfo
      integrationAppInfo.value = {
        ...integrationAppInfo.value,
        [appKey]: data,
      }
      return
    } catch {
      // Try the next configured endpoint before falling back to the card icon.
    }
  }
}

onMounted(async () => {
  const configuredBaseUrl = configString('buenoHostBaseUrl')
  const baseUrl = configuredBaseUrl || (import.meta.client ? window.location.origin : defaultBuenoHostBaseUrl)

  qrTargetUrl.value = new URL(demoInfoPath, normalizeBaseUrl(baseUrl)).toString()
  qrDataUrl.value = await toDataURL(qrTargetUrl.value, {
    width: 512,
    margin: 1,
    errorCorrectionLevel: 'H',
  })

  await Promise.all(
    integrationCards
      .map((card) => card.appKey)
      .filter((appKey): appKey is IntegrationAppKey => Boolean(appKey))
      .map((appKey) => fetchIntegrationAppInfo(appKey))
  )
})

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'BuenoHost',
  description: 'Turn house manuals into digital stay companions with a guest URL, QR code and host console.',
})
</script>
