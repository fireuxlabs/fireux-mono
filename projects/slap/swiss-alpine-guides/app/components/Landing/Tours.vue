<template>
  <section id="tours" class="alpine-tours" aria-labelledby="tours-title">
    <UContainer class="alpine-tours__surface">
      <div class="alpine-tours__intro">
        <p class="alpine-kicker">Heliskiing &amp; Heliboarding</p>
        <h2 id="tours-title">Tours</h2>
        <p>
          Routes and tour information published by Swiss Alpine Guides.
          Departures depend on suitable snow and weather conditions.
        </p>
      </div>
      <div class="alpine-tours__grid">
        <article
          v-for="(tour, index) in tours"
          :key="tour.id"
          class="alpine-tour"
        >
          <div class="alpine-tour__top">
            <span>0{{ index + 1 }}</span
            ><span>{{ tour.tag }}</span>
          </div>
          <h3><NuxtLink :to="tourPageForRoute(tour.id).path">{{ tour.name }}</NuxtLink></h3>
          <p class="alpine-tour__altitude">
            {{ tour.altitude }} <span>above sea level</span>
          </p>

          <p class="alpine-tour__description">{{ tour.description }}</p>
          <dl class="alpine-tour__facts">
            <div>
              <dt>Flights</dt>
              <dd>{{ tour.flights }}</dd>
            </div>
            <div>
              <dt>Descent</dt>
              <dd>{{ tour.distance }}</dd>
            </div>
            <div>
              <dt>Vertical</dt>
              <dd>{{ tour.vertical }}</dd>
            </div>
            <div>
              <dt>Season</dt>
              <dd>{{ tour.season }}</dd>
            </div>
          </dl>
          <p class="alpine-tour__description">{{ tour.requirement }}</p>
          <div class="alpine-tour__action">
            <span>Price: confirm with operator</span
            ><div class="alpine-tour__buttons"><UButton
              :to="tourPageForRoute(tour.id).path"
              color="neutral"
              :aria-label="`View ${tour.name} tour`"
              >View tour</UButton><UButton
              :to="{ path: '/contact', query: { tour: tour.id }, hash: '#enquire' }"
              variant="link"
              color="neutral"
              :aria-label="`Enquire about ${tour.route}`"
              >Enquire <span aria-hidden="true">↗</span></UButton
            ></div>
          </div>
        </article>
        <div class="alpine-tour alpine-tour--personal">
          <p class="alpine-kicker">Swiss Alpine Guides</p>
          <h3>Enquiries</h3>
          <p>
            Meeting point: Interlaken, by arrangement. The website lists a
            minimum of seven participants and private mountain guides on
            request.
          </p>
          <UButton to="/contact" color="neutral" variant="outline"
            >Enquire ↗</UButton
          >
        </div>
      </div>
      <p class="alpine-tours__note">
        The operator’s language versions show different prices. Confirm the
        current price, departure and equipment when enquiring.
        <a :href="tourSources.english" target="_blank" rel="noopener noreferrer"
          >Operator tour information ↗</a
        >
      </p>
    </UContainer>
  </section>
</template>
<script setup lang="ts">
import { tours, tourSources } from '~/content/tours'
import { tourPageForRoute } from '~/content/tour-pages'
</script>
<style scoped>
.alpine-tours {
  position: relative;
  z-index: 2;
  margin-top: calc(-1 * clamp(10rem, 28svh, 18rem));
  padding: 0 0 48px;
  scroll-margin-top: calc(var(--ui-header-height, 4rem) + 1rem);
  background: transparent;
}
.alpine-tours__surface {
  padding: clamp(24px, 4vw, 48px);
  background: #f3f3ef;
  border-radius: 28px 28px 0 0;
}
.alpine-tours__intro {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 14px 80px;
  margin-bottom: 28px;
  align-items: end;
}
.alpine-kicker {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.alpine-tours__intro > .alpine-kicker {
  grid-column: 1/-1;
}
.alpine-tours h2 {
  font:
    400 clamp(38px, 4.8vw, 68px) / 1.05 Georgia,
    serif;
  letter-spacing: -0.035em;
  margin: 0;
}
.alpine-tours h2 em {
  color: #72847b;
  font-weight: 400;
}
.alpine-tours__intro > p:last-child {
  max-width: 440px;
  font-size: 15px;
  line-height: 1.8;
  color: #53676c;
}
.alpine-tours__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.alpine-tour {
  border: 1px solid #cdd5d1;
  border-radius: 16px;
  background: #fff;
  padding: 30px;
  display: flex;
  flex-direction: column;
  min-height: 360px;
}
.alpine-tour__top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #657d80;
  gap: 15px;
}
.alpine-tour__altitude {
  font:
    400 24px Georgia,
    serif;
  margin: 12px 0 20px;
  color: #72847b;
}
.alpine-tour__altitude span {
  display: block;
  font: 9px sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: 5px;
}
.alpine-tour h3 {
  font:
    400 27px/1.2 Georgia,
    serif;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}
.alpine-tour h3 a { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .2em; }
.alpine-tour__route {
  font-size: 11px;
  letter-spacing: 0.03em;
  margin-bottom: 18px;
}
.alpine-tour__description,
.alpine-tour--personal > p:not(.alpine-kicker) {
  font-size: 13px;
  line-height: 1.8;
  color: #53676c;
  margin-bottom: 25px;
}
.alpine-tour__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0 0 22px;
  font-size: 12px;
}
.alpine-tour__facts dt {
  font-size: 9px;
  color: #53676c;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.alpine-tour__facts dd {
  margin: 4px 0 0;
}
.alpine-tours__note a {
  text-decoration: underline;
}
.alpine-tour__action {
  margin-top: auto;
  display: grid;
  gap: 12px;
  font-size: 11px;
  color: #53676c;
}
.alpine-tour__buttons { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.alpine-tour--personal {
  background: #e5e9e2;
  justify-content: center;
  align-items: flex-start;
}
.alpine-tour--personal h3 {
  font-size: 38px;
  margin: 24px 0 20px;
}
.alpine-tours__note {
  font-size: 10px;
  color: #53676c;
  margin-top: 18px;
  max-width: 800px;
  line-height: 1.6;
}
@media (max-width: 900px) {
  .alpine-tours__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .alpine-tours__intro {
    gap: 24px;
  }
}
@media (max-width: 600px) {
  .alpine-tours {
    padding-bottom: 32px;
  }
  .alpine-tours__intro {
    grid-template-columns: .8fr 1.6fr;
    gap: 12px 20px;
  }
  .alpine-tours__intro > p:last-child {
    margin: 0;
    font-size: 12px;
    line-height: 1.65;
  }
  .alpine-tours__intro > .alpine-kicker {
    margin-bottom: 0;
  }
  .alpine-tours__grid {
    grid-template-columns: 1fr;
  }
  .alpine-tour {
    min-height: 330px;
    padding: 26px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .alpine-tours { margin-top: 0; }
}
</style>
