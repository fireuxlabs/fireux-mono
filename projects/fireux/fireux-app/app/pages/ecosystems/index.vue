<template>
  <UPage>
    <section class="border-b border-default py-12 sm:py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">
          Published ecosystem directory
        </UBadge>

        <div class="max-w-3xl space-y-4">
          <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
            FireUX ecosystems
          </h1>
          <p class="text-lg text-muted">
            Explore the public ecosystem layer built on FireUX. Each ecosystem has its own identity, main app, products, pricing, and tenant-app path.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton to="/ecosystems/pricing" color="primary" icon="i-lucide-badge-dollar-sign">
            Create an ecosystem
          </UButton>
          <UButton to="/ecosystems/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">
            Learn more
          </UButton>
        </div>
      </UContainer>
    </section>

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading ecosystems"
      />

      <UAlert
        v-else-if="!publishedEcosystems.length"
        color="warning"
        variant="soft"
        title="No published ecosystems"
        description="No active ecosystem records are available yet."
      />

      <div
        v-else
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <UCard
          v-for="ecosystem in publishedEcosystems"
          :key="ecosystem.id"
          class="h-full"
        >
          <template #header>
            <div class="flex items-start gap-3">
              <UAvatar
                :src="ecosystem.imageUrl || undefined"
                :alt="ecosystem.name"
                :text="ecosystem.name"
                icon="i-lucide-orbit"
                size="md"
              />

              <div class="min-w-0 flex-1">
                <h2 class="truncate text-base font-semibold text-highlighted">
                  {{ ecosystem.name }}
                </h2>
                <p class="truncate text-sm text-muted">
                  {{ ecosystem.slug }}
                </p>
              </div>

              <UBadge color="success" variant="soft" size="xs">
                Published
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-sm text-muted">
              <span v-if="ecosystem.description">{{ ecosystem.description }}</span>
              <span v-else class="italic">Description pending.</span>
            </p>

            <div class="flex flex-wrap gap-2">
              <UBadge color="neutral" variant="soft" size="xs">
                {{ ecosystem.appCount }} app{{ ecosystem.appCount === 1 ? '' : 's' }}
              </UBadge>
              <UBadge v-if="ecosystem.team" color="neutral" variant="soft" size="xs">
                {{ ecosystem.team }}
              </UBadge>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="ecosystem.to"
                :to="ecosystem.to"
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-lucide-orbit"
              >
                View ecosystem
              </UButton>
              <UButton
                v-if="ecosystem.sourceUrl"
                :to="ecosystem.sourceUrl"
                target="_blank"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-external-link"
              >
                Open app
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useEcosystemCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'

definePageMeta({
  tag: 'ecosystems',
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Ecosystems',
  description: 'Explore active FireUX ecosystems.',
  layout: 'default',
  name: 'EcosystemsIndexPage',
})

useSeoMeta({
  title: 'FireUX Ecosystems',
  description:
    'Browse published FireUX ecosystems including Misebox, Cleanbox, Bringli, Granite, and the FireUX platform ecosystem.',
})

const { ecosystems, pending } = useEcosystemCollection()

const clean = (value: unknown) => String(value ?? '').trim()
const appCount = (apps: unknown) =>
  Array.isArray(apps)
    ? apps.length
    : Number.isFinite(Number(apps))
      ? Number(apps)
      : 0

const publishedEcosystems = computed(() =>
  ecosystems.value
    .filter((entry) => clean(entry.status) === 'active')
    .map((entry) => {
      const id = clean(entry.id)
      const slug = clean(entry.slug)

      return {
        id,
        slug,
        name: clean(entry.name) || id,
        description: clean(entry.description),
        imageUrl: clean(entry.image_url || entry.src),
        sourceUrl: clean(entry.source_url || entry.href),
        team: clean(entry.team),
        appCount: appCount(entry.apps),
        to: slug ? `/ecosystems/${encodeURIComponent(slug)}` : '',
      }
    })
    .filter((entry) => entry.id && entry.slug)
    .sort((a, b) => a.name.localeCompare(b.name))
)
</script>
