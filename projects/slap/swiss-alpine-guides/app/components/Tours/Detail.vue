<template>
  <UContainer id="content" class="alpine-detail">
    <UBreadcrumb :items="[{ label: 'Heliskiing in Interlaken', to: '/#tours' }, { label: page.name }]" />
    <UPage>
      <UPageHeader :title="page.name" :description="page.description" headline="Swiss Alpine Guides · Interlaken" />
      <UPageBody>
        <section aria-labelledby="route-heading">
          <h2 id="route-heading">{{ page.routes.length > 1 ? 'Compare the descents' : 'The route' }}</h2>
          <div class="alpine-detail__routes">
            <UCard v-for="tour in page.routes" :key="tour.id">
              <template #header><h3>{{ tour.name }}</h3><p>{{ tour.tag }}</p></template>
              <p class="alpine-detail__description">{{ tour.description }}</p>
              <dl class="alpine-detail__facts">
                <div v-for="fact in facts(tour)" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div>
              </dl>
              <p><strong>Experience:</strong> {{ tour.requirement }}</p>
              <template #footer><UButton :to="{ path: '/', query: { tour: tour.id }, hash: '#enquire' }" color="neutral" :label="`Enquire about ${tour.name}`" /></template>
            </UCard>
          </div>
        </section>
        <section class="alpine-detail__planning" aria-labelledby="planning-heading"><h2 id="planning-heading">Before you enquire</h2><UAccordion :items="tourPlanning" /></section>
        <section class="alpine-detail__contact" aria-labelledby="operator-heading">
          <h2 id="operator-heading">{{ operator.name }}</h2>
          <p>{{ operator.address }}</p>
          <p><a :href="`tel:${operator.telephone}`">{{ operator.phoneLabel }}</a> · <a :href="`mailto:${operator.email}`">{{ operator.email }}</a></p>
          <p>Confirm the current price, your suitability and your preferred date directly with the operator. An enquiry does not reserve a flight or confirm a departure.</p>
          <p class="alpine-detail__sources">Route information: <a v-for="source in sources" :key="source" :href="source" target="_blank" rel="noopener noreferrer">Swiss Alpine Guides {{ source.includes('/Deutsch/') ? '(German)' : '(English)' }} ↗</a></p>
        </section>
        <section aria-labelledby="other-tours-heading"><h2 id="other-tours-heading">Other heliskiing routes</h2><div class="alpine-detail__related"><UButton v-for="other in related" :key="other.slug" :to="other.path" :label="other.name" color="neutral" variant="outline" /></div></section>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
<script setup lang="ts">
import { operator } from '~/content/operator'
import { tourPages, tourPlanning, type TourPage } from '~/content/tour-pages'
const props = defineProps<{ page: TourPage }>()
const related = computed(() => tourPages.filter(page => page.slug !== props.page.slug))
const sources = computed(() => [...new Set(props.page.routes.map(tour => tour.source))])
function facts(tour: TourPage['routes'][number]) {
  return [{ label: 'Altitude', value: tour.altitude }, { label: 'Flights', value: String(tour.flights) }, { label: 'Descent', value: tour.distance }, { label: 'Vertical', value: tour.vertical }, { label: 'Published season', value: tour.season }, { label: 'Price', value: 'Confirm with operator' }]
}
</script>
<style scoped>
.alpine-detail { padding-block: 2rem 4rem; }
.alpine-detail h2 { font: 400 clamp(1.7rem, 3vw, 2.3rem)/1.2 Georgia, serif; margin-bottom: 1.5rem; letter-spacing: -.025em; }
.alpine-detail h3 { font-size: 1.25rem; font-weight: 600; }
.alpine-detail p { line-height: 1.8; }
.alpine-detail__routes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 1.5rem; }
.alpine-detail__description { margin-bottom: 1.5rem; }
.alpine-detail__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
.alpine-detail__facts dt { font-size: .75rem; color: var(--ui-text-muted); }
.alpine-detail__facts dd { margin: .3rem 0 0; font-weight: 600; }
.alpine-detail__planning, .alpine-detail__contact { padding-block: 1rem; }
.alpine-detail__contact { max-width: 52rem; }
.alpine-detail__contact a { text-decoration: underline; text-underline-offset: .2em; }
.alpine-detail__sources { display: flex; flex-wrap: wrap; gap: .5rem 1rem; font-size: .8rem; color: var(--ui-text-muted); margin-top: 1.5rem; }
.alpine-detail__related { display: flex; flex-wrap: wrap; gap: .75rem; }
</style>
