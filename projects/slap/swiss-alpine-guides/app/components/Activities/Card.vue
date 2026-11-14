<template>
  <article class="activity-card">
    <NuxtLink
      :to="activity.path"
      class="activity-card__image"
      :aria-label="`View ${activity.name}`"
    >
      <picture v-if="activity.image">
        <source
          :srcset="activityImageSources(activity.image, 'avif')"
          type="image/avif"
          sizes="(max-width: 600px) 170vw, (max-width: 900px) 80vw, 55vw"
        />
        <img
          :src="activity.image"
          :srcset="activityImageSources(activity.image)"
          sizes="(max-width: 600px) 170vw, (max-width: 900px) 80vw, 55vw"
          :alt="`${activity.name} — photograph from the operator’s original site`"
          width="1000"
          height="400"
          loading="lazy"
          decoding="async"
        />
      </picture>
      <span v-else class="activity-card__placeholder"
        >Original-site listing</span
      >
      <span class="activity-card__shade" aria-hidden="true" />
      <span class="activity-card__season"
        >{{ activity.seasons.join(' · ')
        }}<span v-if="activity.legacy"> · Confirm operation</span></span
      >
      <h3>{{ activity.name }}</h3>
      <span class="activity-card__arrow" aria-hidden="true">↗</span>
    </NuxtLink>
    <div class="activity-card__body">
      <p class="activity-card__count">
        {{
          activity.heliski
            ? '5 heli routes'
            : `${activity.programs.length} ${activity.programs.length === 1 ? 'programme' : 'programmes'}`
        }}
      </p>
      <p>{{ activity.summary }}</p>
      <UButton
        :to="activity.path"
        color="neutral"
        variant="outline"
        :aria-label="`Explore ${activity.name}`"
        >Explore activity ↗</UButton
      >
    </div>
  </article>
</template>
<script setup lang="ts">
import { activityImageSources, type Activity } from '~/content/activities'
defineProps<{ activity: Activity }>()
</script>
<style scoped>
.activity-card {
  overflow: hidden;
  border: 1px solid #142d351a;
  border-radius: 1.25rem;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.activity-card__image {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;
  min-height: 15rem;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: #25464e;
  color: #fff;
  padding: 1.5rem;
}
.activity-card__image img,
.activity-card__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.activity-card__image img {
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.2, 0.65, 0.3, 1);
}
.activity-card__shade {
  background: linear-gradient(
    180deg,
    #0a202c55,
    transparent 30%,
    #071c29d9 100%
  );
}
.activity-card__image:hover img {
  transform: scale(1.045);
}
.activity-card__season,
.activity-card h3,
.activity-card__arrow {
  position: relative;
}
.activity-card h3 {
  font:
    400 clamp(1.8rem, 2.5vw, 2.4rem) / 1.06 Georgia,
    serif;
  letter-spacing: -0.035em;
  max-width: 13ch;
  margin-right: 1.25rem;
  text-wrap: balance;
}
.activity-card__season {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.activity-card__arrow {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  font-size: 1.4rem;
}
.activity-card__placeholder {
  position: absolute;
  top: 35%;
  font-size: 0.75rem;
  color: #ceddd8;
}
.activity-card__body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
}
.activity-card__body > p:not(.activity-card__count) {
  font-size: 0.82rem;
  line-height: 1.8;
  color: #53676c;
}
.activity-card__count {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #53676c;
}
.activity-card__body > a:last-child {
  margin-top: auto;
  align-self: start;
}
@media (prefers-reduced-motion: reduce) {
  .activity-card__image img {
    transition: none;
  }
  .activity-card__image:hover img {
    transform: none;
  }
}
</style>
