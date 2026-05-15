<template>
  <div v-if="resolvedGuide && resolvedSection" class="min-w-0 space-y-8">
    <section class="space-y-5">
      <NuxtLink
        :to="`/bnb/${resolvedGuide.slug}`"
        class="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <Icon name="i-lucide-arrow-left" class="size-4" />
        {{ resolvedGuide.title }}
      </NuxtLink>

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            BNB guest guide
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ resolvedGuide.property.name }}
          </UBadge>
        </div>

        <div class="grid gap-4 sm:flex sm:items-start">
          <div class="rounded-md bg-primary/10 p-3 text-primary">
            <Icon :name="resolvedSection.icon" class="size-7" />
          </div>
          <div>
            <p class="text-sm font-semibold uppercase text-muted">
              {{ resolvedGuide.title }}
            </p>
            <h1 class="mt-2 text-3xl font-semibold tracking-normal text-highlighted sm:text-5xl">
              {{ resolvedSection.title }}
            </h1>
            <p class="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {{ resolvedSection.summary }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4" aria-labelledby="section-content-title">
      <h2 id="section-content-title" class="sr-only">
        {{ resolvedSection.title }} details
      </h2>

      <UCard>
        <ul class="grid gap-2">
          <li
            v-for="item in resolvedSection.items"
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

      <div class="grid gap-3 sm:flex sm:flex-wrap">
        <UButton
          v-if="previousSection"
          :to="topicPath(previousSection.id)"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          block
          class="sm:w-auto"
        >
          {{ previousSection.title }}
        </UButton>
        <UButton
          v-if="nextSection"
          :to="topicPath(nextSection.id)"
          trailing-icon="i-lucide-arrow-right"
          color="primary"
          variant="soft"
          block
          class="sm:w-auto"
        >
          {{ nextSection.title }}
        </UButton>
      </div>
    </section>
  </div>
  <UCard v-else>
    <div class="space-y-3">
      <UBadge color="warning" variant="soft">
        Error 404
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted">
        BNB guide section not found
      </h1>
      <p class="text-muted">
        This topic is not enabled for this guest guide.
      </p>
      <UButton to="/" color="primary" variant="soft">
        Back to Sproochli
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import {
  getBnbGuestTopics,
  resolveBnbGuide,
  resolveBnbSection,
  type BnbGuideItem,
} from '../../../demo/bnbGuides'

definePageMeta({
  layout: 'bnb',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const sectionId = computed(() => String(route.params.sectionId || ''))
const guide = computed(() => resolveBnbGuide(slug.value))
const section = computed(() => resolveBnbSection(slug.value, sectionId.value))

const resolvedGuide = computed(() => guide.value)
const resolvedSection = computed(() => section.value)

if (!resolvedGuide.value || !resolvedSection.value) {
  setResponseStatus(404)
}

const guestTopics = computed(() =>
  resolvedGuide.value ? getBnbGuestTopics(resolvedGuide.value) : []
)
const currentIndex = computed(() =>
  guestTopics.value.findIndex((topic) => topic.id === resolvedSection.value?.id)
)
const previousSection = computed(() =>
  currentIndex.value > 0 ? guestTopics.value[currentIndex.value - 1] : null
)
const nextSection = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < guestTopics.value.length - 1
    ? guestTopics.value[currentIndex.value + 1]
    : null
)

function topicPath(targetSectionId: string) {
  return `/bnb/${resolvedGuide.value?.slug || slug.value}/${targetSectionId}`
}

function itemClass(tone: BnbGuideItem['tone']) {
  if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
  if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
  return 'bg-default text-default'
}

useSeoMeta({
  title: computed(() =>
    resolvedGuide.value && resolvedSection.value
      ? `${resolvedSection.value.title} · ${resolvedGuide.value.title}`
      : 'BNB guide section not found'
  ),
  description: computed(() => resolvedSection.value?.summary || 'BNB guide section not found'),
})
</script>
