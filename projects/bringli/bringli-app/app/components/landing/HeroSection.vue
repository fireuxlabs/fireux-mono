<template>
  <LandingShell>
    <template #left>
      <div class="landing-hero">
        <div class="landing-hero__heading">
          <h1 class="hero-title">
            <strong>{{ heroTitle }}</strong>
          </h1>
          <h1 v-if="heroAccent" class="hero-title hero-title--accent">
            {{ heroAccent }}
          </h1>
        </div>

        <div class="landing-hero__body">
          <p class="landing-hero__paragraph" v-html="heroParagraph" />

          <div class="landing-hero__actions">
            <UButton
              to="/get-started"
              size="lg"
              color="primary"
              icon="i-lucide-rocket"
            >
              Get started
            </UButton>
            <UButton
              to="/suppliers"
              size="lg"
              variant="outline"
              trailing-icon="i-lucide-arrow-right"
            >
              Browse producers
            </UButton>
          </div>

          <p class="landing-hero__paragraph" v-html="systemLine" />
        </div>

        <div
          v-if="hasConsoleEntry && consoleEntries.length"
          class="landing-hero__actions"
        >
          <UButton
            v-for="entry in consoleEntries"
            :key="entry.key"
            size="lg"
            variant="subtle"
            color="primary"
            :to="entry.path"
            icon="i-lucide-terminal"
          >
            {{ entry.label }}
          </UButton>
        </div>

        <ul class="grid gap-3 pt-2 sm:grid-cols-2">
          <li
            v-for="item in heroBullets"
            :key="item.text"
            class="flex items-center gap-2 text-sm"
          >
            <UIcon :name="item.icon" class="shrink-0 text-primary" />
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </template>

    <template #right>
      <div class="space-y-6 lg:pl-4">
        <LandingBrandBadge />
        <LandingQuickLinks />
      </div>
    </template>
  </LandingShell>
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'

const heroParagraph =
  'Bringli is the operating system for producers and customers. Connect local producers, suppliers, and households in one simple order and drop flow powered by <a href="/suppliers"><strong>Drop</strong></a>.'
const systemLine =
  'The operating system for local supply and delivery execution from one connected console.'
const heroTitle = 'Local Producers,'
const heroAccent = 'Delivered'

const { hasConsoleEntry, consoleEntries } = useConsoleEntryCta()

const heroBullets = [
  {
    icon: 'i-lucide-leaf',
    text: 'Fresh local producers and suppliers in one directory',
  },
  {
    icon: 'i-lucide-truck',
    text: 'Home and business dropoff flows built for reliability',
  },
  {
    icon: 'i-lucide-store',
    text: 'Supplier onboarding and profile management through Drop',
  },
  {
    icon: 'i-lucide-map-pinned',
    text: 'Launched in Interlaken with market-by-market expansion',
  },
]
</script>
