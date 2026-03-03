<template>
  <section class="landing-index-section">
    <LandingShell>
      <template #left>
        <div class="landing-hero">
          <div class="landing-hero__heading">
            <h1 class="hero-title">
              <strong>{{ title }}</strong>
            </h1>
            <h1 v-if="accent" class="hero-title hero-title--accent">
              {{ accent }}
            </h1>
          </div>

          <div class="landing-hero__body">
            <p class="landing-hero__paragraph" v-html="paragraph" />

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
                to="/dashboard/portfolios"
                size="lg"
                variant="outline"
                trailing-icon="i-lucide-arrow-right"
              >
                Browse portfolios
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

          <ul class="landing-hero__bullets">
            <li class="landing-hero__bullet">
              <UIcon name="i-lucide-shield-check" class="shrink-0" />
              <span>Compliance oversight across every managed property</span>
            </li>
            <li class="landing-hero__bullet">
              <UIcon name="i-lucide-folder" class="shrink-0" />
              <span>Documents organised by client portfolio and asset</span>
            </li>
            <li class="landing-hero__bullet">
              <UIcon name="i-lucide-alert-triangle" class="shrink-0" />
              <span>Incidents and follow-ups tracked with clear ownership</span>
            </li>
            <li class="landing-hero__bullet">
              <UIcon name="i-lucide-trending-up" class="shrink-0" />
              <span>Finance and advisory signals surfaced at portfolio level</span>
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
  </section>
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'

const title = 'Rock Solid'
const accent = 'Portfolio Control'
const paragraph =
  'Granite is the operating system for landlords and agencies. Oversee properties, compliance exposure, documents, incidents, and financial signals from one structured portfolio console.'
const systemLine =
  'The operating system for branch-level portfolio oversight with audit-ready records and clear accountability.'

const { hasConsoleEntry, consoleEntries } = useConsoleEntryCta()
</script>
