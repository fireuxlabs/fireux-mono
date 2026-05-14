<template>
  <div class="space-y-8">
    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-5">
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            BNB guest guide
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
            {{ resolvedGuide.property.name }}
          </p>
          <h1 class="max-w-3xl text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
            {{ resolvedGuide.title }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {{ welcomeSection?.summary || 'A clean mobile guest guide for your stay.' }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton :href="`tel:${phoneHref}`" icon="i-lucide-phone" color="primary">
            Call Natalie
          </UButton>
          <UButton :href="`mailto:${resolvedGuide.property.email}`" icon="i-lucide-mail" color="neutral" variant="soft">
            Email
          </UButton>
        </div>

        <UCard v-if="resolvedGuide.guest_message">
          <div class="flex items-start gap-3">
            <div class="rounded-md bg-primary/10 p-2 text-primary">
              <Icon name="i-lucide-calendar-heart" class="size-5" />
            </div>
            <div>
              <h2 class="text-2xl font-semibold text-highlighted">
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
            <dd>{{ resolvedGuide.property.address }}</dd>
          </div>
        </dl>
      </UCard>
    </section>

    <UAlert
      icon="i-lucide-shield-alert"
      color="warning"
      variant="soft"
      title="Privacy check before public launch"
      :description="resolvedGuide.privacy_note"
    />

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
          Standard BNB topics
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
              <h2 class="text-xl font-semibold">{{ section.title }}</h2>
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
</template>

<script setup lang="ts">
import {
  getBnbGuestTopics,
  getEnabledBnbSections,
  resolveBnbGuide,
  type BnbGuideItem,
} from '../../../content/bnbGuides'

definePageMeta({
  layout: 'bnb',
  alias: ['/sproochli/bnb/:slug'],
})

const route = useRoute()
const guide = computed(() => resolveBnbGuide(String(route.params.slug || '')))

if (!guide.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'BNB guide not found',
  })
}

const resolvedGuide = computed(() => guide.value!)
const enabledSections = computed(() => getEnabledBnbSections(resolvedGuide.value))
const welcomeSection = computed(() => enabledSections.value.find((section) => section.id === 'welcome'))
const guestTopics = computed(() => getBnbGuestTopics(resolvedGuide.value))
const prioritySections = computed(() => guestTopics.value.filter((section) => section.priority))
const regularSections = computed(() => guestTopics.value.filter((section) => !section.priority))
const phoneHref = computed(() => resolvedGuide.value.property.phone.replace(/\s+/g, ''))

function topicPath(sectionId: string) {
  return `/bnb/${resolvedGuide.value.slug}/${sectionId}`
}

function itemClass(tone: BnbGuideItem['tone']) {
  if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
  if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
  return 'bg-default text-default'
}

useSeoMeta({
  title: computed(() => `${resolvedGuide.value.title} · ${resolvedGuide.value.property.name}`),
  description: computed(() => `Guest guide for ${resolvedGuide.value.property.name}`),
})
</script>
