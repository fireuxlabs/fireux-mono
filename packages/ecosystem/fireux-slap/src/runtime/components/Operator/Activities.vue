<template>
  <UContainer id="content" class="operator-activities">
    <header class="operator-header">
      <div><p class="operator-eyebrow">Operator preview</p><p class="operator-name">{{ operatorName }}</p></div>
      <UButton to="/" color="neutral" variant="outline" label="View website" />
    </header>

    <section class="operator-intro" aria-labelledby="activities-heading">
      <div><p class="operator-eyebrow">Activity catalogue</p><h1 id="activities-heading">Your activities.</h1><p>Route information, requirements and pricing in one place.</p></div>
      <UBadge color="neutral" variant="soft" label="UI preview" size="lg" />
    </section>

    <div class="operator-stats" aria-label="Catalogue summary">
      <div><strong>{{ activities.length.toString().padStart(2, '0') }}</strong><span>Source activities</span></div>
      <div><strong>{{ categories.length.toString().padStart(2, '0') }}</strong><span>Activity types</span></div>
      <div><strong>{{ activities.filter(item => item.reviewNeeded).length.toString().padStart(2, '0') }}</strong><span>Prices to review</span></div>
    </div>

    <div class="operator-toolbar">
      <UFormField label="Search activities"><UInput class="operator-control" v-model="search" placeholder="Search by name or route" type="search" /></UFormField>
      <UFormField label="Activity type"><USelect class="operator-control" v-model="category" :items="['All types', ...categories]" /></UFormField>
      <UFormField label="Review"><USelect class="operator-control" v-model="review" :items="['All activities', 'Prices to review']" /></UFormField>
    </div>

    <div class="operator-workbench">
      <section id="operator-catalogue" class="operator-catalogue" aria-label="Activity list">
        <div class="operator-list-heading"><h2>Activities</h2><span role="status">{{ filtered.length }} shown</span></div>
        <div v-if="!filtered.length" class="operator-empty"><h3>No matching activities</h3><p>Try another name or clear your filters.</p><UButton label="Clear filters" variant="soft" @click="clearFilters" /></div>
        <button v-for="activity in filtered" :key="activity.id" type="button" class="operator-activity-row" :class="{ 'is-selected': selected?.id === activity.id }" :aria-pressed="selected?.id === activity.id" @click="selectActivity(activity.id)">
          <span class="operator-row-top"><span class="operator-category">{{ activity.category }}</span><span class="operator-review">{{ activity.reviewNeeded ? 'Price review' : 'Source content' }}</span></span>
          <strong>{{ activity.name }}</strong>
          <span class="operator-row-facts">{{ activity.facts.slice(0, 2).map(fact => fact.value).join(' · ') }}</span>
          <span class="operator-row-bottom"><span>{{ activity.price }}</span><span aria-hidden="true">↗</span></span>
        </button>
      </section>

      <section v-if="selected" ref="detail" tabindex="-1" class="operator-detail" aria-labelledby="activity-detail-title" aria-live="polite">
        <a class="operator-back" href="#operator-catalogue">↑ All activities</a>
        <p class="operator-eyebrow">Activity details</p><h2 id="activity-detail-title">{{ selected.name }}</h2>
        <UBadge color="neutral" variant="soft" :label="selected.category" />
        <p class="operator-description">{{ selected.description }}</p>
        <dl class="operator-facts"><div v-for="fact in selected.facts" :key="fact.label"><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div></dl>
        <div class="operator-detail-section"><h3>Requirements & inclusions</h3><ul><li v-for="requirement in selected.requirements" :key="requirement">{{ requirement }}</li></ul></div>
        <div class="operator-price"><span>Listed price</span><strong>{{ selected.price }}</strong></div>
        <UAlert v-if="selected.reviewNeeded" color="warning" variant="soft" title="Confirm current pricing" description="Source pages show conflicting prices. Review with the operator before publishing a quote." />
        <div class="operator-detail-actions"><UButton :to="selected.publicTo" label="Customer view" color="neutral" /><UButton :to="selected.source" target="_blank" rel="noopener noreferrer" label="Source information ↗" color="neutral" variant="outline" /></div>
      </section>
    </div>
    <p class="operator-preview-note">Public catalogue preview. Availability, customer requests and changes to operator records are not connected.</p>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { OperatorActivity } from '../../types/operator-activity'
const props = defineProps<{ operatorName: string; activities: OperatorActivity[] }>()
const search = ref(''), category = ref('All types'), review = ref('All activities'), selectedId = ref('')
const detail = ref<HTMLElement | null>(null)
async function selectActivity(id: string) {
  selectedId.value = id
  await nextTick()
  if (window.matchMedia('(max-width: 700px)').matches) {
    detail.value?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    detail.value?.focus({ preventScroll: true })
  }
}
const categories = computed(() => [...new Set(props.activities.map(item => item.category))])
const filtered = computed(() => props.activities.filter(item =>
  (category.value === 'All types' || item.category === category.value) &&
  (review.value !== 'Prices to review' || item.reviewNeeded) &&
  `${item.name} ${item.description}`.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())
))
const selected = computed(() => filtered.value.find(item => item.id === selectedId.value) ?? filtered.value[0])
function clearFilters() { search.value = ''; category.value = 'All types'; review.value = 'All activities' }
</script>

<style scoped>
.operator-activities { padding-block: 1.5rem 3rem; color: var(--ui-text); }
.operator-header, .operator-intro, .operator-row-top, .operator-row-bottom, .operator-list-heading { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.operator-header { padding-block-end: 1.25rem; border-bottom: 1px solid var(--ui-border); }
.operator-eyebrow { margin: 0 0 .35rem; font-size: .7rem; font-weight: 650; text-transform: uppercase; letter-spacing: .16em; color: var(--ui-text-muted); }
.operator-name { margin: 0; font-weight: 650; font-size: .95rem; }
.operator-intro { padding-block: 2.5rem 2rem; }
.operator-intro h1 { margin: 0 0 .5rem; font-size: clamp(2.2rem, 5vw, 3.6rem); letter-spacing: -.045em; line-height: 1.1; }
.operator-intro p:last-child { color: var(--ui-text-muted); margin-bottom: 0; }
.operator-stats { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--ui-border); border-radius: 1rem; background: var(--ui-bg); overflow: hidden; }
.operator-stats > div { padding: 1.4rem; display: grid; gap: .3rem; }
.operator-stats > div + div { border-left: 1px solid var(--ui-border); }
.operator-stats strong { font-size: 2rem; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -.04em; }
.operator-stats span { color: var(--ui-text-muted); font-size: .8rem; }
.operator-toolbar { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding-block: 1.75rem; }
.operator-control { width: 100%; }
.operator-toolbar :deep(input), .operator-toolbar :deep(button[role='combobox']) { width: 100%; }
.operator-workbench { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 1.5rem; align-items: start; }
.operator-list-heading { margin-bottom: .8rem; }
.operator-list-heading h2 { margin: 0; font-size: 1rem; }
.operator-list-heading span { color: var(--ui-text-muted); font-size: .75rem; }
.operator-activity-row { display: grid; width: 100%; gap: .6rem; text-align: left; padding: 1.2rem; margin-bottom: .65rem; border: 1px solid var(--ui-border); border-radius: .85rem; background: var(--ui-bg); cursor: pointer; transition: background .15s, border-color .15s; }
.operator-activity-row:hover { border-color: var(--ui-border-accented); }
.operator-activity-row:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 3px; }
.operator-activity-row.is-selected { border-color: var(--ui-primary); background: color-mix(in srgb, var(--ui-primary) 6%, var(--ui-bg)); }
.operator-activity-row > strong { font-size: 1.2rem; letter-spacing: -.02em; }
.operator-category, .operator-review { font-size: .68rem; font-weight: 600; color: var(--ui-text-muted); }
.operator-category { text-transform: uppercase; letter-spacing: .08em; }
.operator-row-facts { color: var(--ui-text-muted); font-size: .85rem; }
.operator-row-bottom { padding-top: .4rem; font-size: .8rem; }
.operator-detail { position: sticky; top: 1rem; padding: 1.6rem; border: 1px solid var(--ui-border); border-radius: 1rem; background: var(--ui-bg); }
.operator-back { display: none; }
.operator-detail h2 { font-size: 1.9rem; letter-spacing: -.035em; line-height: 1.15; margin: .5rem 0 1rem; }
.operator-description { color: var(--ui-text-muted); line-height: 1.7; font-size: .9rem; margin-block: 1.25rem; }
.operator-facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.1rem; border-block: 1px solid var(--ui-border); padding-block: 1.2rem; }
.operator-facts dt { color: var(--ui-text-muted); font-size: .7rem; margin-bottom: .3rem; }
.operator-facts dd { margin: 0; font-weight: 600; font-size: .9rem; }
.operator-detail-section h3 { font-size: .9rem; margin-block: 1.3rem .6rem; }
.operator-detail-section ul { padding-left: 1.1rem; color: var(--ui-text-muted); font-size: .85rem; line-height: 1.8; }
.operator-price { display: grid; gap: .3rem; padding-block: 1.2rem; }
.operator-price span, .operator-preview-note { font-size: .75rem; color: var(--ui-text-muted); }
.operator-price strong { font-size: 1.15rem; }
.operator-detail-actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.5rem; }
.operator-preview-note { margin-top: 1.5rem; line-height: 1.6; }
.operator-empty { padding: 2rem; border: 1px dashed var(--ui-border); border-radius: 1rem; }
@media (max-width: 700px) {
  .operator-intro { align-items: start; }
  .operator-intro > span { margin-top: .5rem; }
  .operator-stats > div { padding: 1rem .7rem; }
  .operator-stats strong { font-size: 1.6rem; }
  .operator-stats span { font-size: .65rem; }
  .operator-toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .operator-toolbar > :first-child { grid-column: 1 / -1; }
  .operator-workbench { grid-template-columns: 1fr; }
  .operator-back { display: block; margin-bottom: 1.2rem; font-size: .8rem; }
  .operator-detail { position: static; padding: 1.25rem; }
  .operator-header { align-items: start; }
}
</style>
