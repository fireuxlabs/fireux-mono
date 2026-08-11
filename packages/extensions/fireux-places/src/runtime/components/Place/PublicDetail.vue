<!-- Concurrent edit — 2026-07-21 14:52 CEST — Place provenance/privacy hardening: remove public self-claim controls until verified ownership proof exists. -->
<!-- Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: expose the guarded developer/admin removal action. -->
<template>
  <UPage class="place-public">
    <UPageBody class="pagebody">
      <MoleculesStateCard
        v-if="outcome === 'pending' || outcome === 'idle'"
        entity="place"
        kind="document"
        loading
      />

      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="place"
        kind="document"
        state="error"
        title="Place unavailable"
        description="This place could not be loaded. Please try again."
      >
        <UButton
          label="Try again"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="soft"
          size="sm"
          @click="refresh"
        />
      </MoleculesStateCard>

      <MoleculesStateCard
        v-else-if="!place"
        entity="place"
        kind="document"
        state="missing"
        title="Place not found"
        description="This place does not exist or is not available publicly."
      >
        <UButton
          label="Browse places"
          icon="i-lucide-arrow-left"
          to="/places"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </MoleculesStateCard>

      <div v-else class="place-public__detail" :style="detailStyle">
        <nav class="place-public__toolbar" aria-label="Place directory">
          <UButton
            to="/places"
            label="All places"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
          />
          <UButton
            v-if="isAdmin"
            :to="editTo"
            label="Edit place"
            icon="i-lucide-pencil"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </nav>

        <PublicEntityHero
          :title="place.name"
          eyebrow="Place"
          :cover-url="place.assets.cover"
          cover-alt=""
          :image-url="heroIdentityUrl"
          :image-alt="heroIdentityAlt"
          :image-fit="heroIdentityFit"
          :media-background="heroMediaBackground"
          :initials="initials"
          :description="place.brand_tagline"
          :location="place.short_address"
        >
          <template #badges>
            <UBadge color="neutral" variant="soft">
              {{ placeTypeLabel }}
            </UBadge>
            <UBadge
              v-if="place.verified"
              color="success"
              variant="soft"
              icon="i-lucide-badge-check"
            >
              Verified
            </UBadge>
          </template>

          <template v-if="primaryActions.length" #actions>
            <UButton
              v-for="action in primaryActions"
              :key="action.label"
              :to="action.to"
              :icon="action.icon"
              :target="action.target"
              :rel="action.rel"
              :aria-label="action.ariaLabel"
              :color="action.key === 'directions' ? 'primary' : 'neutral'"
              :variant="action.key === 'directions' ? 'solid' : 'soft'"
            >
              {{ action.label }}
            </UButton>
          </template>
        </PublicEntityHero>

        <section
          v-if="place.assets.logo || place.assets.wordmark"
          class="place-public__brand"
          aria-label="Place identity"
        >
          <img
            v-if="place.assets.wordmark"
            :src="place.assets.wordmark"
            :alt="`${place.name} wordmark`"
            class="place-public__wordmark"
          >
          <img
            v-else-if="place.assets.logo"
            :src="place.assets.logo"
            :alt="`${place.name} logo`"
            class="place-public__logo"
          >
        </section>

        <div
          class="place-public__content"
          :class="{ 'place-public__content--utilities': !hasEditorialContent }"
        >
          <div v-if="hasEditorialContent" class="place-public__editorial">
            <section v-if="place.about" class="place-public__about">
              <div class="place-public__section-heading">
                <p class="fx-type-label">About</p>
                <h2 class="fx-type-section-title">
                  {{ place.short_name || place.name }}
                </h2>
              </div>
              <p class="place-public__story fx-type-body">{{ place.about }}</p>
            </section>

            <section
              v-if="place.assets.gallery.length"
              class="place-public__gallery-section"
              aria-labelledby="place-gallery-title"
            >
              <div class="place-public__section-heading">
                <p class="fx-type-label">Gallery</p>
                <h2 id="place-gallery-title" class="fx-type-section-title">
                  Inside {{ place.short_name || place.name }}
                </h2>
              </div>
              <div class="place-public__gallery">
                <figure
                  v-for="(image, index) in place.assets.gallery"
                  :key="image"
                >
                  <div class="place-public__media-fallback" aria-hidden="true">
                    <UIcon name="i-lucide-image" />
                  </div>
                  <img
                    :src="image"
                    :alt="`${place.name} gallery image ${index + 1}`"
                    loading="lazy"
                    decoding="async"
                    @error="hideFailedImage"
                  />
                </figure>
              </div>
            </section>
          </div>

          <aside class="place-public__utilities" aria-label="Place information">
            <UCard
              v-if="hasVisitDetails || hoursRows.length || facts.length"
              class="place-public__utility-card place-public__info-panel"
            >
              <div class="place-public__info-grid">
                <section
                  v-if="hasVisitDetails"
                  class="place-public__info-section"
                >
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-map-pin" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Visit</p>
                      <h2 class="fx-type-card-heading">Find this place</h2>
                    </div>
                  </div>

                  <div class="place-public__visit">
                    <p v-if="place.short_address">{{ place.short_address }}</p>
                    <a
                      v-if="place.website"
                      :href="place.website"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ websiteLabel }}
                      <UIcon name="i-lucide-external-link" aria-hidden="true" />
                    </a>
                  </div>

                  <div
                    v-if="!hoursRows.length && place.place_type === 'physical'"
                    class="place-public__provider-hours"
                  >
                    <p class="fx-type-label">Current provider details</p>
                    <PlaceGoogleHours
                      :place-id="place.id"
                      button-label="Check Google hours"
                    />
                  </div>
                </section>

                <section
                  v-if="hoursRows.length"
                  class="place-public__info-section"
                >
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-clock-3" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Opening hours</p>
                      <h2 class="fx-type-card-heading">When to visit</h2>
                    </div>
                  </div>

                  <dl class="place-public__hours">
                    <div
                      v-for="row in hoursRows"
                      :key="`${row.days}-${row.time}`"
                    >
                      <dt>{{ row.days }}</dt>
                      <dd>{{ row.time }}</dd>
                    </div>
                  </dl>
                  <p v-if="place.timezone" class="place-public__timezone-note">
                    Times shown in {{ place.timezone }}.
                  </p>
                </section>

                <section v-if="facts.length" class="place-public__info-section">
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-landmark" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Venue facts</p>
                      <h2 class="fx-type-card-heading">At a glance</h2>
                    </div>
                  </div>

                  <dl class="place-public__facts">
                    <div v-for="fact in facts" :key="fact.label">
                      <dt>{{ fact.label }}</dt>
                      <dd>{{ fact.value }}</dd>
                    </div>
                  </dl>
                </section>

                <section v-if="socialActions.length" class="place-public__info-section">
                  <div class="place-public__utility-heading">
                    <span>
                      <UIcon name="i-lucide-at-sign" aria-hidden="true" />
                    </span>
                    <div>
                      <p class="fx-type-label">Around the web</p>
                      <h2 class="fx-type-card-heading">Follow this place</h2>
                    </div>
                  </div>

                  <div class="place-public__socials">
                    <UButton
                      v-for="social in socialActions"
                      :key="social.key"
                      :label="social.label"
                      :to="social.to"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    />
                  </div>
                </section>
              </div>
            </UCard>
          </aside>
        </div>

        <component
          :is="relatedOperationsComponent"
          v-if="relatedOperationsComponent"
          :place-id="place.id"
          :place-name="place.name"
        />

        <PlaceAssetsLibrary
          v-if="isAdmin || showDebug"
          :place="place"
        />

        <PlaceDelete :place="place" />

        <DevJson
          v-if="showDebug"
          title="Place (Public Projection)"
          context="Place detail page · places/[id] · bounded public projection"
          :data="place"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { setResponseStatus } from '#imports'
import { usePlaceDetail } from '../../composables/fireux/place/usePlaceDetail'

const props = defineProps<{ locator: string }>()
const detail = usePlaceDetail(props)

await detail.ready
if (import.meta.server && detail.missing.value) {
  setResponseStatus(404)
} else if (import.meta.server && detail.failed.value) {
  setResponseStatus(
    detail.statusCode.value >= 400 ? detail.statusCode.value : 503
  )
}

const {
  place,
  outcome,
  refresh,
  isAdmin,
  showDebug,
  relatedOperationsComponent,
  initials,
  detailStyle,
  heroIdentityUrl,
  heroIdentityFit,
  heroIdentityAlt,
  heroMediaBackground,
  placeTypeLabel,
  primaryActions,
  websiteLabel,
  hasVisitDetails,
  facts,
  socialActions,
  hoursRows,
  hasEditorialContent,
  editTo,
  hideFailedImage,
} = detail
</script>

<style scoped src="./public-detail.css"></style>
