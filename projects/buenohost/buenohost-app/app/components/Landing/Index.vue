<template>
  <FireLandingEcosystemHome
    :content="content"
    hero-image="/img/landing/guest-operations-hero-v1.png"
    hero-alt="A host and colleague preparing an alpine apartment for arriving guests"
    hero-position="54% center"
    rail-label="Guest stay operations"
    :rail-items="railItems"
    :pricing-plans="landingTiers"
    :surface-items="surfaceItems"
  >
    <UContainer>
      <FireLandingProductProofSection
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
          to: '/get-started',
          icon: 'i-lucide-arrow-right',
        }"
      >
        <FireLandingProductHeroImage
          src="/img/app/cover.png"
          alt="BuenoHost guest guide on a mobile device"
        />
      </FireLandingProductProofSection>

      <div class="mt-16">
        <FireLandingSolutions variant="preview" />
      </div>

      <section class="mt-16 space-y-6" aria-labelledby="host-workspace-title">
        <div class="max-w-3xl space-y-2">
          <h2 id="host-workspace-title" class="fx-type-section-title">
            Work from the Host Workspace.
          </h2>
          <p class="fx-type-body">
            Manage the property information used by guest guides and
            reservations.
          </p>
        </div>
        <UPageGrid>
          <UCard
            v-for="feature in workspaceFeatures"
            :key="feature.title"
            variant="subtle"
          >
            <UIcon :name="feature.icon" />
            <h3 class="mt-3 fx-type-card-heading">
              {{ feature.title }}
            </h3>
            <p class="mt-1 fx-type-caption">{{ feature.description }}</p>
          </UCard>
        </UPageGrid>
      </section>

      <section
        class="mt-16 space-y-6"
        aria-labelledby="host-integrations-title"
      >
        <div class="max-w-3xl space-y-2">
          <h2 id="host-integrations-title" class="fx-type-section-title">
            Connect services around the stay.
          </h2>
          <p class="fx-type-body">
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
            <UCard variant="subtle">
              <UIcon :name="card.icon" />
              <h3 class="mt-3 fx-type-card-heading">
                {{ card.title }}
              </h3>
              <p class="mt-1 fx-type-caption">{{ card.description }}</p>
            </UCard>
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </FireLandingEcosystemHome>
</template>

<script setup lang="ts">
import { useBuenoHostHome } from '../../composables/useBuenoHostHome'
import { useBuenoHostPricing } from '../../composables/useBuenoHostPricing'
import { content, railItems, surfaceItems } from './landing-content'

const { workspaceFeatures, isExternalUrl, resolvedIntegrationCards } =
  useBuenoHostHome()
const { landingTiers } = useBuenoHostPricing()
</script>
