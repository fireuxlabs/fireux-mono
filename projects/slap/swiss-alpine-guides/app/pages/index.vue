<template>
  <div id="content">
    <LandingHero />
    <LandingTours />
    <section
      id="mountains"
      class="alpine-experience"
      aria-labelledby="experience-title"
    >
      <UContainer
        ><div class="alpine-experience__grid">
          <p class="alpine-experience__kicker">Tour information</p>
          <h2 id="experience-title">Requirements<br />&amp; equipment</h2>
          <div>
            <p>
              Swiss Alpine Guides lists experienced off-piste ability as a
              requirement. Tours are led by IVBV mountain guides and take place
              only when snow and weather conditions are suitable.
            </p>
            <p>
              Bring complete ski or snowboard equipment, an avalanche
              transceiver, backpack, goggles, food, a drink and sun protection.
              Snowboarders should also bring telescopic poles. Check rental
              requirements with the operator.
            </p>
            <p>
              Listed inclusions are the helicopter flight or flights, guided
              descent and harness. Return transport is additional; participants
              arrange their own insurance.
            </p>
            <p class="alpine-experience__note">
              The operator offers a Heli-Hotline for updates after weather, snow
              and avalanche assessments. Contact Swiss Alpine Guides to register
              your interest.
            </p>
            <UButton to="#enquire" color="neutral" variant="outline"
              >Enquiries ↗</UButton
            >
          </div>
        </div></UContainer
      >
    </section>
    <LandingEnquiry />
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'alpine', colorMode: 'light' })
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { homeSearch } from '~/content/tour-pages'
import { buildTourJsonLd } from '~/utils/tour-seo'
useSeo({
  ...homeSearch,
  path: '/',
  image: '/img/landing/ascent-poster.webp',
  imageWidth: 864,
  imageHeight: 1536,
  jsonLdBuilder: context => buildTourJsonLd(context),
})
</script>
<style scoped>
.alpine-experience {
  scroll-margin-top: calc(var(--ui-header-height, 4rem) + 1rem);
  background: #e4e8e1;
  padding: 95px 0;
}
.alpine-experience__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 100px;
}
.alpine-experience__kicker {
  grid-column: 1/-1;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}
.alpine-experience h2 {
  font:
    400 clamp(40px, 4.5vw, 64px) / 1.1 Georgia,
    serif;
  letter-spacing: -0.04em;
  margin: 12px 0;
}
.alpine-experience h2 em {
  color: #6c8176;
  font-weight: 400;
}
.alpine-experience__grid > div > p {
  font-size: 14px;
  line-height: 1.9;
  margin-bottom: 20px;
  max-width: 490px;
  color: #435e62;
}
.alpine-experience__grid > div > .alpine-experience__note {
  font-size: 12px;
  border-left: 2px solid #8a9b8d;
  padding-left: 18px;
  margin: 28px 0;
}
@media (max-width: 700px) {
  .alpine-experience {
    padding: 65px 0;
  }
  .alpine-experience__grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .alpine-experience h2 {
    margin-bottom: 8px;
  }
}
</style>
