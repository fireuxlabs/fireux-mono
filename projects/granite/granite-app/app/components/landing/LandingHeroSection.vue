<template>
  <section class="landing-index-section">
    <div class="landing-hero">
      <UBadge color="primary" variant="subtle">
        Granite
      </UBadge>

      <div class="landing-hero__heading">
        <h1 class="hero-title">
          Rock solid property portfolio control.
        </h1>
      </div>

      <div class="landing-hero__body">
        <p class="landing-hero__paragraph">
          A console for estate agency branches to oversee client portfolios -
          properties, compliance exposure, documents, incidents, and finance signals.
        </p>

        <div class="landing-hero__actions">
          <UButton
            to="/dashboard/portfolios"
            size="lg"
            color="primary"
            icon="i-lucide-building"
          >
            Select portfolio
          </UButton>

          <UButton
            to="/dashboard/portfolios"
            size="lg"
            variant="outline"
            icon="i-lucide-terminal"
          >
            Enter via selector
          </UButton>

          <ClientOnly>
            <UButton
              v-if="!isAuthenticated"
              to="/get-started"
              size="lg"
              variant="soft"
              color="neutral"
              icon="i-lucide-arrow-right"
            >
              Get started
            </UButton>
          </ClientOnly>
        </div>
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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const auth = import.meta.client ? useAuth() : null
const isAuthenticated = computed(() => auth?.isAuthenticated?.value ?? false)
</script>
