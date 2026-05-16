<template>
  <div v-if="resolvedInfo" class="min-w-0 space-y-8">
    <section class="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-5">
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            Property info
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ resolvedInfo.language.toUpperCase() }}
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
            {{ resolvedProperty.name }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {{ welcomePage?.summary || 'Clean mobile property info for your stay.' }}
          </p>
        </div>

        <div class="grid gap-3 sm:flex sm:flex-wrap">
          <UButton :href="`tel:${phoneHref}`" icon="i-lucide-phone" color="primary" block class="sm:w-auto">
            Call {{ resolvedInfo.property.manager }}
          </UButton>
          <UButton :href="`mailto:${resolvedInfo.property.email}`" icon="i-lucide-mail" color="neutral" variant="soft" block class="sm:w-auto">
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
                  BuenoHost owns this property info. Sproochli owns any translated versions.
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
              description="Looking for published translations for this property info."
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
              description="This property info is currently available in its original English version only."
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

        <UCard v-if="resolvedInfo.stay_message">
          <div class="flex items-start gap-3">
            <div class="rounded-md bg-primary/10 p-2 text-primary">
              <Icon name="i-lucide-calendar-heart" class="size-5" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-highlighted sm:text-2xl">
                {{ resolvedInfo.stay_message.title }}
              </h2>
              <p v-if="resolvedInfo.stay_message.subtitle" class="mt-1 text-sm text-muted">
                {{ resolvedInfo.stay_message.subtitle }}
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
            <dd>{{ resolvedInfo.property.manager }}</dd>
          </div>
          <div>
            <dt class="font-medium text-muted">Phone</dt>
            <dd>{{ resolvedInfo.property.phone }}</dd>
          </div>
          <div>
            <dt class="font-medium text-muted">Email</dt>
            <dd class="break-words">{{ resolvedInfo.property.email }}</dd>
          </div>
          <div>
            <dt class="font-medium text-muted">Address</dt>
            <dd class="break-words">{{ resolvedInfo.property.address }}</dd>
          </div>
        </dl>
      </UCard>
    </section>

    <UCard v-if="welcomePage">
      <template #header>
        <div class="flex items-start gap-3">
          <div class="rounded-md bg-primary/10 p-2 text-primary">
            <Icon :name="welcomePage.icon" class="size-5" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ welcomePage.title }}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">{{ welcomePage.summary }}</p>
          </div>
        </div>
      </template>

      <ul class="grid gap-2">
        <li
          v-for="item in welcomePage.items"
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
        <UCard v-for="topic in priorityTopics" :key="topic.id">
          <template #header>
            <div class="flex items-start gap-3">
              <div class="rounded-md bg-primary/10 p-2 text-primary">
                <Icon :name="topic.icon" class="size-5" />
              </div>
              <div>
                <h3 class="font-semibold">{{ topic.title }}</h3>
                <p class="mt-1 text-sm text-muted">{{ topic.summary }}</p>
              </div>
            </div>
          </template>
          <UButton
            :to="topicPath(topic.id)"
            icon="i-lucide-arrow-right"
            trailing
            block
            color="primary"
            variant="soft"
          >
            Open {{ topic.title }}
          </UButton>
        </UCard>
      </div>
    </section>

    <section aria-label="Property info topics" class="space-y-4">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase text-primary">
          Property info
        </p>
        <h2 class="text-2xl font-semibold">
          Property info topics
        </h2>
        <p class="max-w-2xl text-sm leading-6 text-muted">
          Hosts can enable the info topics that matter for each property. Disabled topics simply disappear from public property info.
        </p>
      </div>

      <UCard v-for="topic in regularTopics" :key="topic.id">
        <template #header>
          <div class="flex items-start gap-3">
            <div class="rounded-md bg-elevated p-2 text-muted">
              <Icon :name="topic.icon" class="size-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold sm:text-xl">{{ topic.title }}</h2>
              <p class="mt-1 text-sm leading-6 text-muted">{{ topic.summary }}</p>
            </div>
          </div>
        </template>

        <UButton
          :to="topicPath(topic.id)"
          icon="i-lucide-arrow-right"
          trailing
          color="neutral"
          variant="soft"
        >
          Open {{ topic.title }}
        </UButton>
      </UCard>
    </section>

    <footer class="border-t border-default pt-6 text-sm text-muted">
      <p>{{ resolvedInfo.footer }}</p>
    </footer>
  </div>
  <UCard v-else>
    <div class="space-y-3">
      <UBadge color="warning" variant="soft">
        Error 404
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted">
        Property info not found
      </h1>
      <p class="text-muted">
        This property info is not available in BuenoHost.
      </p>
      <UButton to="/properties/demo-stay" color="primary" variant="soft">
        Back to properties
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { setResponseStatus, useRuntimeConfig } from '#imports'
import {
  getPropertyInfoTopics,
  getEnabledPropertyInfoTopics,
  resolvePropertyInfo,
  type PropertyInfoItem,
} from '../../../../demo/propertyInfo'
import { findDemoBuenoHostPublicProperty } from '../../../../demo/properties'

definePageMeta({
  layout: 'property-info',
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const property = computed(() => findDemoBuenoHostPublicProperty(String(route.params.slug || '')))
const info = computed(() => property.value ? resolvePropertyInfo(property.value.slug) : null)

if (!info.value) setResponseStatus(404)

const resolvedProperty = computed(() => property.value!)
const resolvedInfo = computed(() => info.value!)
const enabledTopics = computed(() => getEnabledPropertyInfoTopics(resolvedInfo.value))
const welcomePage = computed(() => enabledTopics.value.find((topic) => topic.id === 'welcome'))
const infoTopics = computed(() => getPropertyInfoTopics(resolvedInfo.value))
const priorityTopics = computed(() => infoTopics.value.filter((topic) => topic.priority))
const regularTopics = computed(() => infoTopics.value.filter((topic) => !topic.priority))
const phoneHref = computed(() => resolvedInfo.value.property.phone.replace(/\s+/g, ''))
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
  const ref = resolvedInfo.value.translation_ref
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

function topicPath(infoId: string) {
  return `/properties/${resolvedProperty.value.slug}/info/${infoId}`
}

function itemClass(tone: PropertyInfoItem['tone']) {
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
    resolvedInfo.value
      ? `${resolvedInfo.value.title} · ${resolvedInfo.value.property.name}`
      : 'Property info not found'
  ),
  description: computed(() =>
    resolvedInfo.value
      ? `Property info for ${resolvedInfo.value.property.name}`
      : 'Property info not found'
  ),
})
</script>
