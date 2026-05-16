<template>
  <div v-if="resolvedGuide" class="min-w-0 space-y-8">
    <section class="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-5">
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            Guest guide
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ resolvedGuide.language.toUpperCase() }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            Static proof
          </UBadge>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase text-muted">
            {{ resolvedProperty.name }}
          </p>
          <h1 class="max-w-3xl text-3xl font-semibold tracking-normal text-highlighted sm:text-5xl">
            {{ resolvedGuide.title }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {{ welcomeSection?.summary || 'A clean mobile guest guide for your stay.' }}
          </p>
        </div>

        <div class="grid gap-3 sm:flex sm:flex-wrap">
          <UButton :href="`tel:${phoneHref}`" icon="i-lucide-phone" color="primary" block class="sm:w-auto">
            Call Natalie
          </UButton>
          <UButton :href="`mailto:${resolvedGuide.property.email}`" icon="i-lucide-mail" color="neutral" variant="soft" block class="sm:w-auto">
            Email
          </UButton>
          <UButton
            icon="i-lucide-languages"
            color="primary"
            variant="soft"
            block
            class="sm:w-auto"
            :trailing-icon="showTranslations ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            :aria-expanded="showTranslations"
            aria-controls="sproochli-translations"
            :loading="translationAvailabilityPending"
            @click="toggleTranslations"
          >
            Translate with Sproochli
          </UButton>
        </div>

        <UCard v-if="showTranslations" id="sproochli-translations">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <Icon name="i-lucide-sparkles" class="size-4 text-primary" />
                  <h2 class="font-semibold text-highlighted">
                    Translate with Sproochli
                  </h2>
                </div>
                <p class="text-sm leading-6 text-muted">
                  BuenoHost owns this guide. Sproochli owns any translated versions.
                </p>
              </div>
              <UBadge color="primary" variant="soft">
                Sproochli
              </UBadge>
            </div>

            <UAlert
              v-if="translationAvailabilityPending"
              color="primary"
              variant="soft"
              icon="i-lucide-loader"
              title="Checking Sproochli"
              description="Looking for published translations for this guest guide."
            />

            <UAlert
              v-else-if="translationAvailabilityError"
              color="warning"
              variant="soft"
              icon="i-lucide-circle-alert"
              title="Translations could not be checked"
              :description="translationAvailabilityError"
            />

            <div v-else-if="availableTranslations.length" class="grid gap-2 sm:grid-cols-2">
              <div
                v-for="translation in availableTranslations"
                :key="translation.code"
                class="rounded-md border border-default bg-default px-3 py-2"
                :dir="translation.direction || 'ltr'"
                :lang="translation.code"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-highlighted">
                      {{ translation.native_label || translation.label || translation.code }}
                    </p>
                    <p class="text-xs text-muted">
                      {{ translation.label || translation.code }}
                    </p>
                  </div>
                  <UBadge color="primary" variant="soft">
                    Published
                  </UBadge>
                </div>
              </div>
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              icon="i-lucide-info"
              title="Translations not ready yet"
              description="This guide is currently available in its original English version only."
            />

            <div class="rounded-md border border-dashed border-default bg-muted/30 p-4 text-sm text-muted">
              <div class="flex items-start gap-3">
                <Icon name="i-lucide-languages" class="mt-0.5 size-4 text-primary" />
                <p>
                  Sproochli will only show languages here after they are translated, reviewed, and published.
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="resolvedGuide.guest_message">
          <div class="flex items-start gap-3">
            <div class="rounded-md bg-primary/10 p-2 text-primary">
              <Icon name="i-lucide-calendar-heart" class="size-5" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-highlighted sm:text-2xl">
                {{ resolvedGuide.guest_message.title }}
              </h2>
              <p v-if="resolvedGuide.guest_message.subtitle" class="mt-1 text-sm text-muted">
                {{ resolvedGuide.guest_message.subtitle }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="i-lucide-map-pin" class="size-4 text-primary" />
            <h2 class="text-sm font-semibold">
              Property
            </h2>
          </div>
        </template>
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="font-medium text-muted">Manager</dt>
            <dd>{{ resolvedGuide.property.manager }}</dd>
          </div>
          <div>
            <dt class="font-medium text-muted">Phone</dt>
            <dd>{{ resolvedGuide.property.phone }}</dd>
          </div>
          <div>
            <dt class="font-medium text-muted">Email</dt>
            <dd class="break-words">{{ resolvedGuide.property.email }}</dd>
          </div>
          <div>
            <dt class="font-medium text-muted">Address</dt>
            <dd class="break-words">{{ resolvedGuide.property.address }}</dd>
          </div>
        </dl>
      </UCard>
    </section>

    <UCard v-if="welcomeSection">
      <template #header>
        <div class="flex items-start gap-3">
          <div class="rounded-md bg-primary/10 p-2 text-primary">
            <Icon :name="welcomeSection.icon" class="size-5" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ welcomeSection.title }}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">{{ welcomeSection.summary }}</p>
          </div>
        </div>
      </template>

      <ul class="grid gap-2">
        <li
          v-for="item in welcomeSection.items"
          :key="item.label || item.value"
          class="rounded-md border border-default px-3 py-2 text-sm"
          :class="itemClass(item.tone)"
        >
          <span v-if="item.label" class="block text-xs font-semibold uppercase opacity-70">
            {{ item.label }}
          </span>
          <span>{{ item.value }}</span>
        </li>
      </ul>
    </UCard>

    <section aria-labelledby="priority-title" class="space-y-4">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase text-primary">
          Quick access
        </p>
        <h2 id="priority-title" class="text-2xl font-semibold">
          Most-needed guest info
        </h2>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UCard v-for="section in prioritySections" :key="section.id">
          <template #header>
            <div class="flex items-start gap-3">
              <div class="rounded-md bg-primary/10 p-2 text-primary">
                <Icon :name="section.icon" class="size-5" />
              </div>
              <div>
                <h3 class="font-semibold">{{ section.title }}</h3>
                <p class="mt-1 text-sm text-muted">{{ section.summary }}</p>
              </div>
            </div>
          </template>
          <UButton
            :to="topicPath(section.id)"
            icon="i-lucide-arrow-right"
            trailing
            block
            color="primary"
            variant="soft"
          >
            Open {{ section.title }}
          </UButton>
        </UCard>
      </div>
    </section>

    <section aria-label="Guest guide topics" class="space-y-4">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase text-primary">
          Guest guide
        </p>
        <h2 class="text-2xl font-semibold">
          Guest guide topics
        </h2>
        <p class="max-w-2xl text-sm leading-6 text-muted">
          Hosts can enable the topics that matter for each property. Disabled topics simply disappear from the guest guide.
        </p>
      </div>

      <UCard v-for="section in regularSections" :key="section.id">
        <template #header>
          <div class="flex items-start gap-3">
            <div class="rounded-md bg-elevated p-2 text-muted">
              <Icon :name="section.icon" class="size-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold sm:text-xl">{{ section.title }}</h2>
              <p class="mt-1 text-sm leading-6 text-muted">{{ section.summary }}</p>
            </div>
          </div>
        </template>

        <UButton
          :to="topicPath(section.id)"
          icon="i-lucide-arrow-right"
          trailing
          color="neutral"
          variant="soft"
        >
          Open {{ section.title }}
        </UButton>
      </UCard>
    </section>

    <footer class="border-t border-default pt-6 text-sm text-muted">
      <p>{{ resolvedGuide.footer }}</p>
    </footer>
  </div>
  <UCard v-else>
    <div class="space-y-3">
      <UBadge color="warning" variant="soft">
        Error 404
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted">
        Guest guide not found
      </h1>
      <p class="text-muted">
        This guide is not available in BuenoHost.
      </p>
      <UButton to="/properties/holiday-with-nats" color="primary" variant="soft">
        Back to properties
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import {
  getGuestGuideTopics,
  getEnabledGuestGuideSections,
  resolveGuestGuide,
  type GuestGuideItem,
} from '../../../../demo/guestGuides'
import { findDemoBuenoHostPublicProperty } from '../../../../demo/properties'

definePageMeta({
  layout: 'guest-guide',
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const property = computed(() => findDemoBuenoHostPublicProperty(String(route.params.slug || '')))
const guide = computed(() => property.value ? resolveGuestGuide(property.value.guide_slug) : null)

if (!guide.value) setResponseStatus(404)

const resolvedProperty = computed(() => property.value!)
const resolvedGuide = computed(() => guide.value!)
const enabledSections = computed(() => getEnabledGuestGuideSections(resolvedGuide.value))
const welcomeSection = computed(() => enabledSections.value.find((section) => section.id === 'welcome'))
const guestTopics = computed(() => getGuestGuideTopics(resolvedGuide.value))
const prioritySections = computed(() => guestTopics.value.filter((section) => section.priority))
const regularSections = computed(() => guestTopics.value.filter((section) => !section.priority))
const phoneHref = computed(() => resolvedGuide.value.property.phone.replace(/\s+/g, ''))
const showTranslations = ref(false)
const translationAvailability = ref<TranslationAvailabilityResponse | null>(null)
const translationAvailabilityPending = ref(false)
const translationAvailabilityError = ref('')
const availableTranslations = computed(() => translationAvailability.value?.available_languages ?? [])

const sproochliBaseUrl = computed(() => {
  const configured = String(runtimeConfig.public.sproochliBaseUrl || '').trim().replace(/\/+$/, '')
  if (configured) return configured
  return import.meta.dev ? 'http://localhost:3011' : 'https://sproochli.web.app'
})

const translationAvailabilityUrl = computed(() => {
  const ref = resolvedGuide.value.translation_ref
  const search = new URLSearchParams({
    source_app: ref.source_app,
    document_type: ref.document_type,
    document_slug: ref.document_slug,
  })
  return `${sproochliBaseUrl.value}/api/public/translations/available?${search.toString()}`
})

type PublishedTranslation = {
  code: string
  label?: string
  native_label?: string
  direction?: 'ltr' | 'rtl'
}

type TranslationAvailabilityResponse = {
  source_app: string
  document_type: string
  document_slug: string
  source_language: string
  available_languages: PublishedTranslation[]
  translations_ready: boolean
}

function topicPath(sectionId: string) {
  return `/properties/${resolvedProperty.value.slug}/guide/${sectionId}`
}

function itemClass(tone: GuestGuideItem['tone']) {
  if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
  if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
  return 'bg-default text-default'
}

async function toggleTranslations() {
  showTranslations.value = !showTranslations.value
  if (!showTranslations.value) return
  if (translationAvailability.value || translationAvailabilityPending.value) return

  await loadTranslationAvailability()
}

async function loadTranslationAvailability() {
  translationAvailabilityPending.value = true
  translationAvailabilityError.value = ''

  try {
    const response = await fetch(translationAvailabilityUrl.value)
    if (!response.ok) throw new Error(`Sproochli returned ${response.status}`)
    translationAvailability.value = await response.json() as TranslationAvailabilityResponse
  } catch (error) {
    translationAvailabilityError.value = error instanceof Error
      ? error.message
      : 'Sproochli is not reachable right now.'
  } finally {
    translationAvailabilityPending.value = false
  }
}

useSeoMeta({
  title: computed(() =>
    resolvedGuide.value
      ? `${resolvedGuide.value.title} · ${resolvedGuide.value.property.name}`
      : 'Guest guide not found'
  ),
  description: computed(() =>
    resolvedGuide.value
      ? `Guest guide for ${resolvedGuide.value.property.name}`
      : 'Guest guide not found'
  ),
})
</script>
