<template>
  <UContainer id="content" class="activity-detail">
    <UBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Activities', to: '/activities' }, { label: activity.name }]" />
    <UPage><UPageHeader :title="activity.name" :description="activity.summary" :headline="activity.seasons.join(' · ')" :links="[{ label: 'Enquire', to: `/contact?tour=${activity.slug}`, color: 'neutral' }]" />
      <UPageBody>
        <img v-if="activity.image" class="activity-detail__image" :src="activity.image" :alt="`${activity.name} — original operator photograph`" width="1200" height="700" />
        <UAlert v-if="activity.legacy" color="warning" variant="soft" title="Older original-site listing" :description="activity.note" />
        <template v-if="activity.heliski"><LandingTours /></template>
        <nav v-if="activity.programs.length > 1" class="activity-detail__jump" aria-label="Programmes on this page"><UButton v-for="(program, i) in activity.programs" :key="program.name" :to="`#programme-${i}`" :label="program.name" color="neutral" variant="outline" size="sm" /></nav>
        <section v-for="(program, i) in activity.programs" :id="`programme-${i}`" :key="program.name" class="activity-detail__program">
          <h2>{{ program.name }}</h2><p v-if="program.description">{{ program.description }}</p>
          <dl><div v-for="fact in program.facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
          <UButton :to="{ path: '/contact', query: { tour: activity.slug, programme: program.name } }" color="neutral" :label="`Enquire about ${program.name}`" />
        </section>
        <section v-for="group in activity.common" :key="group.name" class="activity-detail__program"><h2>{{ group.name }}</h2><dl><div v-for="fact in group.facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl></section>
        <section v-if="activity.dates?.length" class="activity-detail__program"><h2>Published programme dates</h2><p>These are the original website’s dated references. Past or inconsistent entries are labelled; contact the operator for the current programme.</p><ul><li v-for="date in activity.dates" :key="date">{{ date }}</li></ul></section>
        <p v-if="activity.note && !activity.legacy" class="activity-detail__notice">{{ activity.note }}</p>
        <p class="activity-detail__notice">Published prices are source references, not a current quote or an offer of available places. Confirm the programme, conditions, equipment, meeting point and total price with Swiss Alpine Guides.</p>
        <section class="activity-detail__contact"><h2>{{ operator.name }}</h2><p>{{ operator.address }}</p><p><a :href="`tel:${operator.telephone}`">{{ operator.phoneLabel }}</a> · <a :href="`mailto:${operator.email}`">{{ operator.email }}</a></p><p>Source information checked {{ activity.checked }}: <a v-for="(source, i) in activity.sources || [activity.source]" :key="source" :href="source" target="_blank" rel="noopener noreferrer">Original {{ source.includes('/Deutsch/') ? 'German' : 'English' }} page{{ i ? ' ↗' : ' ↗ · ' }}</a></p></section>
        <UButton to="/activities" color="neutral" variant="outline" label="Explore all activities" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
<script setup lang="ts">
import type { Activity } from '~/content/activities'
import { operator } from '~/content/operator'
defineProps<{ activity: Activity }>()
</script>
<style scoped>
.activity-detail { padding-block: 2rem 4rem; }
.activity-detail__image { width: 100%; max-height: 520px; aspect-ratio: 16/8; object-fit: cover; border-radius: 20px; }
.activity-detail h2 { font: 400 clamp(28px, 4vw, 42px)/1.15 Georgia, serif; margin-bottom: 1rem; letter-spacing: -.025em; }
.activity-detail p, .activity-detail li { font-size: 15px; line-height: 1.85; }
.activity-detail__jump { display: flex; flex-wrap: wrap; gap: 10px; }
.activity-detail__program { padding-block: 1rem; scroll-margin-top: calc(var(--ui-header-height, 4rem) + 1rem); }
.activity-detail__program dl { margin-block: 1.5rem; border-top: 1px solid #d4dcd6; }
.activity-detail__program dl > div { display: grid; grid-template-columns: minmax(130px, 1fr) 3fr; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #d4dcd6; }
.activity-detail dt { font-size: .8rem; color: #53676c; }
.activity-detail dd { margin: 0; font-size: .9rem; line-height: 1.8; }
.activity-detail ul { padding-left: 1.2rem; }
.activity-detail__notice { border-left: 2px solid #8a9b8d; padding-left: 1rem; color: #53676c; }
.activity-detail__contact a { text-decoration: underline; overflow-wrap: anywhere; }
.activity-detail :deep(.alpine-tours) { margin-top: 0; }
@media (max-width: 600px) { .activity-detail__program dl > div { grid-template-columns: 1fr; gap: .35rem; } }
</style>
