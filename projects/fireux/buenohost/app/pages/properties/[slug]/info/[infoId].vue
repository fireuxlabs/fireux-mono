<template>
  <div v-if="resolvedInfo && resolvedTopic" class="min-w-0 space-y-8">
    <section class="space-y-5">
      <NuxtLink
        :to="propertyInfoPath"
        class="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <Icon name="i-lucide-arrow-left" class="size-4" />
        {{ resolvedInfo.title }}
      </NuxtLink>

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            Property info
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ resolvedInfo.property.name }}
          </UBadge>
        </div>

        <div class="grid gap-4 sm:flex sm:items-start">
          <div class="rounded-md bg-primary/10 p-3 text-primary">
            <Icon :name="resolvedTopic.icon" class="size-7" />
          </div>
          <div>
            <p class="text-sm font-semibold uppercase text-muted">
              {{ resolvedInfo.title }}
            </p>
            <h1 class="mt-2 text-3xl font-semibold tracking-normal text-highlighted sm:text-5xl">
              {{ resolvedTopic.title }}
            </h1>
            <p class="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {{ resolvedTopic.summary }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4" aria-labelledby="page-content-title">
      <h2 id="page-content-title" class="sr-only">
        {{ resolvedTopic.title }} details
      </h2>

      <UCard>
        <ul class="grid gap-2">
          <li
            v-for="item in resolvedTopic.items"
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
          v-if="previousTopic"
          :to="topicPath(previousTopic.id)"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          block
          class="sm:w-auto"
        >
          {{ previousTopic.title }}
        </UButton>
        <UButton
          v-if="nextTopic"
          :to="topicPath(nextTopic.id)"
          trailing-icon="i-lucide-arrow-right"
          color="primary"
          variant="soft"
          block
          class="sm:w-auto"
        >
          {{ nextTopic.title }}
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
        Property info topic not found
      </h1>
      <p class="text-muted">
        This info topic is not enabled for this property.
      </p>
      <UButton to="/" color="primary" variant="soft">
        Back to BuenoHost
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus } from '#imports'
import {
  getPropertyInfoTopics,
  resolvePropertyInfo,
  resolvePropertyInfoTopic,
  type PropertyInfoItem,
} from '../../../../demo/propertyInfo'
import { findDemoBuenoHostPublicProperty } from '../../../../demo/properties'

definePageMeta({
  layout: 'property-info',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const infoId = computed(() => String(route.params.infoId || ''))
const property = computed(() => findDemoBuenoHostPublicProperty(slug.value))
const info = computed(() => property.value ? resolvePropertyInfo(property.value.slug) : null)
const topic = computed(() =>
  property.value ? resolvePropertyInfoTopic(property.value.slug, infoId.value) : null
)

const resolvedProperty = computed(() => property.value)
const resolvedInfo = computed(() => info.value)
const resolvedTopic = computed(() => topic.value)

if (!resolvedInfo.value || !resolvedTopic.value) {
  setResponseStatus(404)
}

const infoTopics = computed(() =>
  resolvedInfo.value ? getPropertyInfoTopics(resolvedInfo.value) : []
)
const currentIndex = computed(() =>
  infoTopics.value.findIndex((topic) => topic.id === resolvedTopic.value?.id)
)
const previousTopic = computed(() =>
  currentIndex.value > 0 ? infoTopics.value[currentIndex.value - 1] : null
)
const nextTopic = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < infoTopics.value.length - 1
    ? infoTopics.value[currentIndex.value + 1]
    : null
)
const propertyInfoPath = computed(() =>
  resolvedProperty.value ? `/properties/${resolvedProperty.value.slug}/info` : '/'
)

function topicPath(targetInfoId: string) {
  if (!resolvedProperty.value) return ''
  return `/properties/${resolvedProperty.value.slug}/info/${targetInfoId}`
}

function itemClass(tone: PropertyInfoItem['tone']) {
  if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
  if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
  return 'bg-default text-default'
}

useSeoMeta({
  title: computed(() =>
    resolvedInfo.value && resolvedTopic.value
      ? `${resolvedTopic.value.title} · ${resolvedInfo.value.title}`
      : 'Property info topic not found'
  ),
  description: computed(() => resolvedTopic.value?.summary || 'Property info topic not found'),
})
</script>
