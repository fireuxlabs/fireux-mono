<template>
  <LandingEcosystemHome
    :content="content"
    hero-image="/img/landing/guest-operations-hero-v1.png"
    hero-alt="A host and colleague preparing an alpine apartment for arriving guests"
    hero-position="54% center"
    rail-label="Guest stay operations"
    :rail-items="railItems"
    :surface-items="surfaceItems"
  >
    <UContainer class="py-16">
      <LandingProductProofSection
        section-id="buenohost-guest-guide"
        eyebrow="Guest guide"
        title="Publish the information guests need."
        description="Keep check-in, Wi-Fi, parking, house rules, local recommendations, checkout and emergency information in one mobile guide."
        :items="[
          'Guest URL and QR code',
          'Reusable guide sections',
          'Property and room information',
          'Reservation-aware host workflow',
        ]"
        :action="{
          label: 'View guest guide',
          to: '/properties/preview-stay/info',
          icon: 'i-lucide-arrow-right',
        }"
      >
        <LandingProductHeroImage
          src="/img/app/cover.png"
          alt="BuenoHost guest guide on a mobile device"
        />
      </LandingProductProofSection>

      <div class="mt-16">
        <LandingSolutions variant="preview" />
      </div>

      <section class="mt-16 space-y-6" aria-labelledby="host-console-title">
        <div class="max-w-3xl space-y-2">
          <h2
            id="host-console-title"
            class="text-2xl font-semibold text-highlighted"
          >
            Work from the Host Console.
          </h2>
          <p class="text-muted">
            Manage the property information used by guest guides and
            reservations.
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <UCard
            v-for="feature in consoleFeatures"
            :key="feature.title"
            variant="subtle"
          >
            <UIcon :name="feature.icon" class="size-6 text-primary" />
            <h3 class="mt-3 font-semibold text-highlighted">
              {{ feature.title }}
            </h3>
            <p class="mt-1 text-sm text-muted">{{ feature.description }}</p>
          </UCard>
        </div>
      </section>

      <section
        class="mt-16 space-y-6"
        aria-labelledby="host-integrations-title"
      >
        <div class="max-w-3xl space-y-2">
          <h2
            id="host-integrations-title"
            class="text-2xl font-semibold text-highlighted"
          >
            Connect services around the stay.
          </h2>
          <p class="text-muted">
            Add translation, local services and related FireUX products without
            changing the guest guide.
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="card in resolvedIntegrationCards"
            :key="card.title"
            :to="card.href"
            :target="isExternalUrl(card.href) ? '_blank' : undefined"
            :rel="isExternalUrl(card.href) ? 'noopener noreferrer' : undefined"
            class="block h-full"
          >
            <UCard variant="subtle" class="h-full">
              <UIcon :name="card.icon" class="size-6 text-primary" />
              <h3 class="mt-3 font-semibold text-highlighted">
                {{ card.title }}
              </h3>
              <p class="mt-1 text-sm text-muted">{{ card.description }}</p>
            </UCard>
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </LandingEcosystemHome>
</template>

<script setup lang="ts">
import { useBuenoHostHome } from '../../../composables/useBuenoHostHome'
import { content, railItems, surfaceItems } from './landing-content'

const { consoleFeatures, isExternalUrl, resolvedIntegrationCards } =
  useBuenoHostHome()
</script>
