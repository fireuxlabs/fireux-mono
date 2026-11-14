<template>
  <header class="activity-hero" :class="{ 'activity-hero--plain': !image }">
    <picture v-if="image">
      <source
        :srcset="activityImageSources(image, 'avif', 'hero')"
        sizes="250svh"
        type="image/avif"
      />
      <img
        class="activity-hero__image"
        :src="image"
        :srcset="activityImageSources(image, 'webp', 'hero')"
        sizes="250svh"
        :style="{ objectPosition: activityImageFocus(image) }"
        :alt="`${title} — original operator photograph`"
        width="4000"
        height="1600"
        fetchpriority="high"
      />
    </picture>
    <div class="activity-hero__shade" aria-hidden="true" />
    <UContainer class="activity-hero__content">
      <UBreadcrumb class="activity-hero__breadcrumb" :items="breadcrumbs" />
      <div class="activity-hero__introduction">
        <p class="activity-hero__kicker">{{ kicker }} · Swiss Alpine Guides</p>
        <h1>{{ title }}</h1>
        <p class="activity-hero__description">{{ description }}</p>
        <div class="activity-hero__actions">
          <UButton :to="anchor" color="neutral" variant="solid" size="lg"
            >{{ actionLabel }} <span aria-hidden="true">↓</span></UButton
          >
          <NuxtLink v-if="enquiry" :to="enquiry" class="activity-hero__enquire"
            >Enquire <span aria-hidden="true">↗</span></NuxtLink
          >
        </div>
      </div>
      <p class="activity-hero__index">{{ detail }}</p>
    </UContainer>
  </header>
</template>
<script setup lang="ts">
import { activityImageFocus, activityImageSources } from '~/content/activities'
withDefaults(
  defineProps<{
    title: string
    description: string
    image?: string
    kicker: string
    detail?: string
    anchor?: string
    actionLabel?: string
    enquiry?: string
    breadcrumbs: { label: string; to?: string }[]
  }>(),
  {
    image: '',
    detail: 'Interlaken · Switzerland',
    anchor: '#programmes',
    actionLabel: 'Explore programmes',
    enquiry: '',
  }
)
</script>
<style scoped>
.activity-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #142d35;
  color: #fff;
  min-height: min(790px, 86svh);
  display: flex;
}
.activity-hero__image,
.activity-hero__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.activity-hero__image {
  object-fit: cover;
}
.activity-hero__shade {
  background: linear-gradient(
    180deg,
    #0a202c55,
    transparent 30%,
    #071c29b3 65%,
    #071c29ed
  );
}
.activity-hero--plain .activity-hero__shade {
  background: linear-gradient(140deg, #142d35, #375b63);
}
.activity-hero__content {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--ui-header-height, 4rem) + 1.75rem);
  padding-bottom: clamp(5rem, 10vw, 8rem);
  width: 100%;
}
.activity-hero__breadcrumb {
  color: #fff;
}
.activity-hero__breadcrumb :deep(a),
.activity-hero__breadcrumb :deep(span) {
  color: #fff;
}
.activity-hero__introduction {
  margin-top: auto;
  padding-top: 5rem;
  max-width: 58rem;
}
.activity-hero__kicker,
.activity-hero__index {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.activity-hero__kicker {
  margin-bottom: 1.25rem;
}
.activity-hero h1 {
  font:
    400 clamp(3.1rem, 7.4vw, 7rem) / 0.99 Georgia,
    serif;
  letter-spacing: -0.055em;
  text-wrap: balance;
  max-width: 13ch;
}
.activity-hero__description {
  font-size: clamp(0.95rem, 1.4vw, 1.12rem);
  line-height: 1.75;
  max-width: 41rem;
  margin-top: 1.5rem;
  color: #e8eeec;
}
.activity-hero__actions {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
}
.activity-hero__actions > a:first-child {
  background: #f3f3ef;
  color: #142d35;
}
.activity-hero__enquire {
  color: #fff;
  font-size: 0.9rem;
  text-decoration: underline;
  text-underline-offset: 0.4rem;
}
.activity-hero__index {
  position: absolute;
  right: 2rem;
  bottom: 3.75rem;
  color: #d7e2df;
}
@media (max-width: 600px) {
  .activity-hero {
    min-height: calc(100svh - var(--ui-header-height, 4rem));
  }
  .activity-hero__content {
    padding-top: calc(var(--ui-header-height, 4rem) + 1.5rem);
    padding-bottom: 5.5rem;
  }
  .activity-hero__introduction {
    padding-top: clamp(6rem, 20svh, 10rem);
  }
  .activity-hero h1 {
    font-size: clamp(2.8rem, 12vw, 4.3rem);
  }
  .activity-hero__index {
    left: 1rem;
    right: auto;
    bottom: 2.75rem;
    font-size: 0.58rem;
  }
}
</style>
