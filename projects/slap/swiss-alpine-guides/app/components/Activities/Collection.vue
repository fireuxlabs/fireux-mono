<template>
  <section id="activities" class="activity-collection" :class="{ 'activity-collection--landing': featured }" aria-labelledby="activities-title">
    <UContainer class="activity-collection__surface">
      <div class="activity-collection__intro"><p class="activity-kicker">Swiss Alpine Guides · Interlaken</p><h2 id="activities-title">{{ title }}</h2><p>Guided mountain activities, courses and private outings. Explore the original operator’s summer and winter programme.</p></div>
      <div v-if="!season && !featured" class="activity-collection__filters"><UFormField label="Activity season"><USelect v-model="filter" :items="['All activities', 'Summer', 'Winter', 'Courses']" /></UFormField><UFormField label="Search activities"><UInput v-model="search" type="search" placeholder="Activity, place or course" /></UFormField></div>
      <div class="activity-collection__grid"><ActivitiesCard v-for="activity in current" :key="activity.slug" :activity="activity" /></div>
      <p v-if="!current.length" role="status">No matching activities. Try another search or season.</p>
      <div v-if="featured" class="activity-collection__more"><UButton to="/activities" color="neutral" label="All activities" /><UButton to="/summer" color="neutral" variant="outline" label="Summer" /><UButton to="/winter" color="neutral" variant="outline" label="Winter" /><UButton to="/courses" color="neutral" variant="outline" label="Courses" /></div>
      <template v-if="!featured && legacy.length"><h2 class="activity-collection__archive">Other listings on the original site</h2><p class="activity-collection__note">These older references are retained for completeness. Confirm whether they are currently offered.</p><div class="activity-collection__grid"><ActivitiesCard v-for="activity in legacy" :key="activity.slug" :activity="activity" /></div></template>
      <p class="activity-collection__note">Dates, suitability, prices and equipment require operator confirmation. Published programme details are not live availability.</p>
    </UContainer>
  </section>
</template>
<script setup lang="ts">
import { activities, featuredActivities } from '~/content/activities'
const props = withDefaults(defineProps<{ featured?: boolean; season?: string; title?: string }>(), { featured: false, season: '', title: 'Activities' })
const filter = ref('All activities'), search = ref('')
const matches = (item: (typeof activities)[number]) => (!props.season && filter.value === 'All activities' || item.seasons.includes(props.season || filter.value)) && `${item.name} ${item.summary}`.toLowerCase().includes(search.value.trim().toLowerCase())
const current = computed(() => props.featured ? featuredActivities : activities.filter(item => !item.legacy && matches(item)))
const legacy = computed(() => activities.filter(item => item.legacy && matches(item)))
</script>
<style scoped>
.activity-collection { padding-block: 1rem 3rem; scroll-margin-top: calc(var(--ui-header-height, 4rem) + 1rem); }
.activity-collection--landing { position: relative; z-index: 2; margin-top: calc(-1 * clamp(10rem, 28svh, 18rem)); padding-top: 0; }
.activity-collection__surface { padding: clamp(24px, 4vw, 48px); background: #f3f3ef; border-radius: 28px 28px 0 0; }
.activity-collection__intro { display: grid; grid-template-columns: 1fr 1.4fr; gap: 12px 40px; align-items: end; margin-bottom: 32px; }
.activity-kicker { grid-column: 1/-1; font-size: 10px; text-transform: uppercase; letter-spacing: .16em; }
.activity-collection h2 { font: 400 clamp(38px, 5vw, 68px)/1.05 Georgia, serif; letter-spacing: -.035em; }
.activity-collection__intro > p:last-child { color: #53676c; font-size: 14px; line-height: 1.8; max-width: 34rem; }
.activity-collection__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.activity-collection__filters, .activity-collection__more { display: flex; flex-wrap: wrap; gap: 16px; margin-block: 24px; }
.activity-collection__filters > * { min-width: 220px; }
.activity-collection__filters :deep(input), .activity-collection__filters :deep(button) { width: 100%; }
.activity-collection__note { font-size: 12px; color: #53676c; line-height: 1.8; margin-block: 24px; }
.activity-collection h2.activity-collection__archive { margin-top: 56px; font-size: 2rem; }
@media (max-width: 900px) { .activity-collection__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .activity-collection__grid { grid-template-columns: 1fr; } .activity-collection__intro { grid-template-columns: 1fr; gap: 12px; } .activity-collection__intro > p:last-child { font-size: 13px; } }
@media (prefers-reduced-motion: reduce) { .activity-collection--landing { margin-top: 0; } }
</style>
