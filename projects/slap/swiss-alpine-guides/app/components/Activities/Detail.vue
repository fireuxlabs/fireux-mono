<template>
  <div id="content" class="activity-detail">
    <ActivitiesHero
      :title="activity.name"
      :description="activity.summary"
      :image="activity.image"
      :kicker="activity.seasons.join(' · ')"
      :detail="
        activity.heliski
          ? '5 heli routes · Guided descents'
          : `${activity.programs.length} ${activity.programs.length === 1 ? 'programme' : 'programmes'} · Interlaken, Switzerland`
      "
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Activities', to: '/activities' },
        { label: activity.name },
      ]"
      :enquiry="`/contact?tour=${activity.slug}`"
    />
    <UContainer id="programmes" class="activity-detail__surface">
      <div class="activity-detail__layout">
        <aside class="activity-detail__guide">
          <p class="activity-detail__eyebrow">
            {{ activity.seasons.join(' · ') }}
          </p>
          <h2>
            {{ activity.heliski ? 'Heliskiing routes' : 'The programmes' }}
          </h2>
          <p>{{ activity.summary }}</p>
          <nav
            v-if="activity.programs.length > 1"
            class="activity-detail__jump"
            aria-label="Programmes on this page"
          >
            <a
              v-for="(program, i) in activity.programs"
              :key="program.name"
              :href="`#programme-${i}`"
              ><span>{{ String(i + 1).padStart(2, '0') }}</span
              >{{ program.name }}<span aria-hidden="true">↘</span></a
            >
          </nav>
          <UButton
            :to="`/contact?tour=${activity.slug}`"
            color="neutral"
            size="lg"
            >Plan this activity ↗</UButton
          >
        </aside>
        <div class="activity-detail__programmes">
          <UAlert
            v-if="activity.legacy"
            color="warning"
            variant="soft"
            title="Older original-site listing"
            :description="activity.note"
          />
          <template v-if="activity.heliski"><LandingTours /></template>
          <section
            v-for="(program, i) in activity.programs"
            :id="`programme-${i}`"
            :key="program.name"
            class="activity-detail__program"
          >
            <p class="activity-detail__number">
              Programme {{ String(i + 1).padStart(2, '0') }}
            </p>
            <h2>{{ program.name }}</h2>
            <p v-if="program.description">{{ program.description }}</p>
            <dl>
              <div v-for="fact in program.facts" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
            <UButton
              :to="{
                path: '/contact',
                query: { tour: activity.slug, programme: program.name },
              }"
              color="neutral"
              :label="`Enquire about ${program.name}`"
            />
          </section>
          <section
            v-for="group in activity.common"
            :key="group.name"
            class="activity-detail__program"
          >
            <h2>{{ group.name }}</h2>
            <dl>
              <div v-for="fact in group.facts" :key="fact.label">
                <dt>{{ fact.label }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
          </section>
          <section
            v-if="activity.dates?.length"
            class="activity-detail__program"
          >
            <h2>Published programme dates</h2>
            <p>
              These are the original website’s dated references. Past or
              inconsistent entries are labelled; contact the operator for the
              current programme.
            </p>
            <ul>
              <li v-for="date in activity.dates" :key="date">{{ date }}</li>
            </ul>
          </section>
          <p
            v-if="activity.note && !activity.legacy"
            class="activity-detail__notice"
          >
            {{ activity.note }}
          </p>
          <p class="activity-detail__notice">
            Published prices are source references, not a current quote or an
            offer of available places. Confirm the programme, conditions,
            equipment, meeting point and total price with Swiss Alpine Guides.
          </p>
          <section class="activity-detail__contact">
            <h2>{{ operator.name }}</h2>
            <p>{{ operator.address }}</p>
            <p>
              <a :href="`tel:${operator.telephone}`">{{
                operator.phoneLabel
              }}</a>
              · <a :href="`mailto:${operator.email}`">{{ operator.email }}</a>
            </p>
            <p>
              Source information checked {{ activity.checked }}:
              <a
                v-for="(source, i) in activity.sources || [activity.source]"
                :key="source"
                :href="source"
                target="_blank"
                rel="noopener noreferrer"
                >Original
                {{ source.includes('/Deutsch/') ? 'German' : 'English' }} page{{
                  i ? ' ↗' : ' ↗ · '
                }}</a
              >
            </p>
          </section>
          <UButton
            to="/activities"
            color="neutral"
            variant="outline"
            label="Explore all activities"
          />
        </div>
      </div>
    </UContainer>
    <ActivitiesRelated :activity="activity" />
  </div>
</template>
<script setup lang="ts">
import type { Activity } from '~/content/activities'
import { operator } from '~/content/operator'
defineProps<{ activity: Activity }>()
</script>
<style scoped>
.activity-detail__surface {
  position: relative;
  margin-top: -2rem;
  padding-top: clamp(2rem, 5vw, 5rem);
  padding-bottom: clamp(3rem, 6vw, 6rem);
  border-radius: 2rem 2rem 0 0;
  background: #f3f3ef;
  scroll-margin-top: var(--ui-header-height, 4rem);
}
.activity-detail__layout {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.65fr);
  gap: clamp(2rem, 5vw, 5rem);
}
.activity-detail__guide {
  position: sticky;
  top: calc(var(--ui-header-height, 4rem) + 2rem);
  align-self: start;
}
.activity-detail__guide > p:not(.activity-detail__eyebrow) {
  color: #53676c;
  margin-bottom: 2rem;
}
.activity-detail__eyebrow,
.activity-detail__number {
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #53676c;
  margin-bottom: 1rem;
}
.activity-detail__programmes {
  min-width: 0;
}
.activity-detail h2 {
  font:
    400 clamp(28px, 4vw, 42px) / 1.15 Georgia,
    serif;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
}
.activity-detail p:not(.activity-detail__number):not(.activity-detail__eyebrow),
.activity-detail li {
  font-size: 15px;
  line-height: 1.85;
}
.activity-detail__jump {
  display: grid;
  margin-bottom: 2rem;
  border-top: 1px solid #142d3530;
  max-height: 42svh;
  overflow-y: auto;
}
.activity-detail__jump a {
  display: grid;
  grid-template-columns: 1.5rem 1fr 1rem;
  gap: 0.5rem;
  border-bottom: 1px solid #142d3530;
  padding: 0.8rem 0;
  font-size: 0.8rem;
  line-height: 1.6;
}
.activity-detail__jump a:hover {
  color: #14716b;
}
.activity-detail__jump span:first-child {
  color: #53676c;
  font-size: 0.65rem;
  padding-top: 0.15rem;
}
.activity-detail__program {
  padding: clamp(1.5rem, 3vw, 2.5rem);
  background: #fff;
  border-radius: 1.25rem;
  margin-bottom: 1.5rem;
  scroll-margin-top: calc(var(--ui-header-height, 4rem) + 1rem);
}
.activity-detail__program dl {
  margin-block: 1.5rem;
  border-top: 1px solid #d4dcd6;
}
.activity-detail__program dl > div {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) 3fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #d4dcd6;
}
.activity-detail dt {
  font-size: 0.8rem;
  color: #53676c;
}
.activity-detail dd {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.8;
}
.activity-detail ul {
  padding-left: 1.2rem;
}
.activity-detail__notice {
  border-left: 2px solid #8a9b8d;
  padding-left: 1rem;
  color: #53676c;
}
.activity-detail__contact a {
  text-decoration: underline;
  overflow-wrap: anywhere;
}
.activity-detail :deep(.alpine-tours) {
  margin-top: 0;
}
.activity-detail :deep(.alpine-tours__surface) {
  padding: 0;
}
.activity-detail :deep(.alpine-tours__grid) {
  grid-template-columns: 1fr;
}
@media (max-width: 900px) {
  .activity-detail__layout {
    grid-template-columns: 1fr;
  }
  .activity-detail__guide {
    position: static;
  }
  .activity-detail__jump {
    max-height: none;
  }
}
@media (max-width: 600px) {
  .activity-detail__program dl > div {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}
</style>
