<template>
  <main class="min-h-screen bg-stone-50 text-stone-950">
    <section class="border-b border-stone-200 bg-white">
      <UContainer class="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:py-12">
        <div class="space-y-5">
          <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Icon name="i-lucide-languages" class="size-4" />
            Sproochli
          </NuxtLink>

          <div class="space-y-3">
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

            <p class="text-sm font-semibold uppercase tracking-[0.26em] text-stone-500">
              {{ resolvedGuide.property.name }}
            </p>
            <h1 class="max-w-3xl text-4xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
              {{ resolvedGuide.title }}
            </h1>
            <p class="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              A clean mobile guest guide for the Penthouse Holiday Apartment, structured for QR access and public JSON.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton :href="`tel:${phoneHref}`" icon="i-lucide-phone" color="primary">
              Call Natalie
            </UButton>
            <UButton :href="`mailto:${resolvedGuide.property.email}`" icon="i-lucide-mail" color="neutral" variant="soft">
              Email
            </UButton>
            <UButton
              :to="apiPath"
              external
              target="_blank"
              icon="i-lucide-braces"
              color="neutral"
              variant="ghost"
            >
              Public JSON
            </UButton>
          </div>
        </div>

        <UCard class="self-start">
          <template #header>
            <div class="flex items-center gap-2">
              <Icon name="i-lucide-map-pin" class="size-4 text-emerald-700" />
              <h2 class="text-sm font-semibold text-stone-950">
                Property
              </h2>
            </div>
          </template>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="font-medium text-stone-500">Manager</dt>
              <dd class="text-stone-900">{{ resolvedGuide.property.manager }}</dd>
            </div>
            <div>
              <dt class="font-medium text-stone-500">Phone</dt>
              <dd class="text-stone-900">{{ resolvedGuide.property.phone }}</dd>
            </div>
            <div>
              <dt class="font-medium text-stone-500">Email</dt>
              <dd class="break-words text-stone-900">{{ resolvedGuide.property.email }}</dd>
            </div>
            <div>
              <dt class="font-medium text-stone-500">Address</dt>
              <dd class="text-stone-900">{{ resolvedGuide.property.address }}</dd>
            </div>
          </dl>
        </UCard>
      </UContainer>
    </section>

    <UContainer class="grid gap-8 py-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside class="hidden lg:block">
        <nav class="sticky top-6 space-y-2" aria-label="Guide sections">
          <p class="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Guide
          </p>
          <a
            v-for="section in resolvedGuide.sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="block rounded px-3 py-2 text-sm text-stone-600 hover:bg-white hover:text-stone-950"
          >
            {{ section.title }}
          </a>
        </nav>
      </aside>

      <div class="space-y-8">
        <UAlert
          icon="i-lucide-shield-alert"
          color="warning"
          variant="soft"
          title="Privacy check before public launch"
          :description="resolvedGuide.privacy_note"
        />

        <section aria-labelledby="priority-title" class="space-y-4">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Quick access
            </p>
            <h2 id="priority-title" class="text-2xl font-semibold text-stone-950">
              Most-needed guest info
            </h2>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UCard v-for="section in prioritySections" :key="section.id">
              <template #header>
                <div class="flex items-start gap-3">
                  <div class="rounded bg-emerald-50 p-2 text-emerald-700">
                    <Icon :name="section.icon" class="size-5" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-stone-950">{{ section.title }}</h3>
                    <p class="mt-1 text-sm text-stone-500">{{ section.summary }}</p>
                  </div>
                </div>
              </template>
              <ul class="space-y-2 text-sm">
                <li
                  v-for="item in section.items"
                  :key="`${section.id}-${item.label || item.value}`"
                  class="rounded border px-3 py-2"
                  :class="itemClass(item.tone)"
                >
                  <span v-if="item.label" class="block text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                    {{ item.label }}
                  </span>
                  <span>{{ item.value }}</span>
                </li>
              </ul>
            </UCard>
          </div>
        </section>

        <section aria-label="All guide sections" class="space-y-4">
          <UCard
            v-for="section in regularSections"
            :id="section.id"
            :key="section.id"
            class="scroll-mt-6"
          >
            <template #header>
              <div class="flex items-start gap-3">
                <div class="rounded bg-stone-100 p-2 text-stone-700">
                  <Icon :name="section.icon" class="size-5" />
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-stone-950">{{ section.title }}</h2>
                  <p class="mt-1 text-sm leading-6 text-stone-500">{{ section.summary }}</p>
                </div>
              </div>
            </template>

            <ul class="grid gap-2">
              <li
                v-for="item in section.items"
                :key="`${section.id}-${item.label || item.value}`"
                class="rounded border px-3 py-2 text-sm"
                :class="itemClass(item.tone)"
              >
                <span v-if="item.label" class="block text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                  {{ item.label }}
                </span>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </UCard>
        </section>

        <footer class="border-t border-stone-200 pt-6 text-sm text-stone-500">
          <p>{{ resolvedGuide.footer }}</p>
        </footer>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import {
  resolveBnbGuide,
  type BnbGuideItem,
} from '../../../content/bnbGuides'

const route = useRoute()
const guide = computed(() => resolveBnbGuide(String(route.params.slug || '')))

if (!guide.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'BNB guide not found',
  })
}

const resolvedGuide = computed(() => guide.value!)
const prioritySections = computed(() => resolvedGuide.value.sections.filter((section) => section.priority))
const regularSections = computed(() => resolvedGuide.value.sections.filter((section) => !section.priority))
const apiPath = computed(() => `/api/public/sproochli/bnb/${resolvedGuide.value.slug}`)
const phoneHref = computed(() => resolvedGuide.value.property.phone.replace(/\s+/g, ''))

function itemClass(tone: BnbGuideItem['tone']) {
  if (tone === 'important') return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  if (tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-950'
  return 'border-stone-200 bg-stone-50 text-stone-800'
}

useSeoMeta({
  title: computed(() => `${resolvedGuide.value.title} · ${resolvedGuide.value.property.name}`),
  description: computed(() => `Guest guide for ${resolvedGuide.value.property.name}`),
})
</script>
