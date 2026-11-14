<template>
  <section class="activity-related" aria-labelledby="related-activities-title">
    <UContainer>
      <div class="activity-related__heading">
        <div>
          <p>Summer · Winter · Courses</p>
          <h2 id="related-activities-title">More mountain activities</h2>
        </div>
        <UButton to="/activities" color="neutral" variant="outline"
          >All activities ↗</UButton
        >
      </div>
      <div class="activity-related__grid">
        <ActivitiesCard
          v-for="item in related"
          :key="item.slug"
          :activity="item"
        />
      </div>
      <div class="activity-related__planning">
        <div>
          <h3>Equipment &amp; gift vouchers</h3>
          <p>
            Rental equipment and activity or value vouchers from Swiss Alpine
            Guides.
          </p>
        </div>
        <div>
          <UButton to="/rentals" color="neutral" variant="outline"
            >Equipment rentals ↗</UButton
          ><UButton to="/vouchers" color="neutral" variant="outline"
            >Gift vouchers ↗</UButton
          >
        </div>
      </div>
    </UContainer>
  </section>
</template>
<script setup lang="ts">
import { activities, type Activity } from '~/content/activities'
const props = defineProps<{ activity: Activity }>()
const related = computed(() => {
  const others = activities.filter(
    (item) => item.slug !== props.activity.slug && !item.legacy
  )
  return [...others]
    .sort((a, b) => {
      const score = (item: Activity) =>
        (props.activity.related?.includes(item.slug) ? 10 : 0) +
        item.seasons.filter((season) => props.activity.seasons.includes(season))
          .length
      return score(b) - score(a)
    })
    .slice(0, 3)
})
</script>
<style scoped>
.activity-related {
  background: #e7ece6;
  padding: clamp(3rem, 7vw, 7rem) 0;
}
.activity-related__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
}
.activity-related__heading p {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.65rem;
  margin-bottom: 1rem;
}
.activity-related h2 {
  font:
    400 clamp(2.4rem, 4.5vw, 4.5rem) / 1.08 Georgia,
    serif;
  letter-spacing: -0.04em;
  max-width: 13ch;
}
.activity-related__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}
.activity-related__planning {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  border-top: 1px solid #142d3530;
  margin-top: 3rem;
  padding-top: 2rem;
}
.activity-related__planning h3 {
  font:
    400 1.8rem/1.2 Georgia,
    serif;
  margin-bottom: 0.5rem;
}
.activity-related__planning p {
  font-size: 0.85rem;
  color: #53676c;
  line-height: 1.7;
}
.activity-related__planning > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-content: center;
}
@media (max-width: 700px) {
  .activity-related__grid {
    grid-template-columns: 1fr;
  }
  .activity-related__heading,
  .activity-related__planning {
    align-items: start;
    flex-direction: column;
  }
}
</style>
