<template>
  <div v-if="resolvedInfo && resolvedSection" class="min-w-0 space-y-8">
    <section class="space-y-5">
      <NuxtLink
        :to="infoPath"
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
            {{ propertyName }}
          </UBadge>
        </div>

        <div class="grid gap-4 sm:flex sm:items-start">
          <div class="rounded-md bg-primary/10 p-3 text-primary">
            <Icon :name="resolvedSection.icon" class="size-7" />
          </div>
          <div>
            <p class="text-sm font-semibold uppercase text-muted">
              {{ resolvedInfo.title }}
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

    <section class="space-y-4" aria-labelledby="page-content-title">
      <h2 id="page-content-title" class="sr-only">
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
          :to="sectionPath(previousSection.id)"
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
          :to="sectionPath(nextSection.id)"
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
        Property info section not found
      </h1>
      <p class="text-muted">
        This property info section is not enabled for this property.
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
  getPropertyInfoSections,
  resolvePropertyInfo,
  resolvePropertyInfoSection,
  type PropertyInfoItem,
} from '../../../../demo/propertyInfo'
import { findDemoBuenoHostPublicProperty } from '../../../../demo/properties'

definePageMeta({
  layout: 'property-info',
})

const route = useRoute()
const propertySlug = computed(() => String(route.params.slug || ''))
const infoId = computed(() => String(route.params.infoId || ''))
const property = computed(() => findDemoBuenoHostPublicProperty(propertySlug.value))
const info = computed(() => property.value ? resolvePropertyInfo(property.value.slug) : null)
const section = computed(() =>
  property.value ? resolvePropertyInfoSection(property.value.slug, infoId.value) : null
)

const resolvedProperty = computed(() => property.value)
const resolvedInfo = computed(() => info.value)
const resolvedSection = computed(() => section.value)
const propertyName = computed(() => resolvedProperty.value?.identity.name || '')

if (!resolvedInfo.value || !resolvedSection.value) {
  setResponseStatus(404)
}

const infoSections = computed(() =>
  resolvedInfo.value ? getPropertyInfoSections(resolvedInfo.value) : []
)
const currentIndex = computed(() =>
  infoSections.value.findIndex((section) => section.id === resolvedSection.value?.id)
)
const previousSection = computed(() =>
  currentIndex.value > 0 ? infoSections.value[currentIndex.value - 1] : null
)
const nextSection = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < infoSections.value.length - 1
    ? infoSections.value[currentIndex.value + 1]
    : null
)
const infoPath = computed(() =>
  resolvedProperty.value ? `/properties/${resolvedProperty.value.slug}/info` : '/'
)

function sectionPath(targetSectionId: string) {
  if (!resolvedProperty.value) return ''
  return `/properties/${resolvedProperty.value.slug}/info/${targetSectionId}`
}

function itemClass(tone: PropertyInfoItem['tone']) {
  if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
  if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
  return 'bg-default text-default'
}

useSeoMeta({
  title: computed(() =>
    resolvedInfo.value && resolvedSection.value
      ? `${resolvedSection.value.title} · ${resolvedInfo.value.title}`
      : 'Property info section not found'
  ),
  description: computed(() => resolvedSection.value?.summary || 'Property info section not found'),
})
</script>
