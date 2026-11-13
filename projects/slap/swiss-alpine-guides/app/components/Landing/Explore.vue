<template>
  <UContainer class="site-explore"><div class="site-explore__grid"><UPageCard title="Equipment rentals" description="Climbing, via ferrata, mountaineering, snowshoe and avalanche equipment in Interlaken." to="/rentals" /><UPageCard title="Gift vouchers" description="Choose an activity or a value in Swiss francs. Request a PDF or postal voucher directly from the operator." to="/vouchers" /><UPageCard title="Private guides & team events" description="Discuss your group, experience, dates and aims with Swiss Alpine Guides." to="/activities/team-events" /></div>
    <section class="site-explore__contact"><div><p class="site-explore__kicker">Mountain guide school · Interlaken</p><h2>{{ operator.name }}</h2><p>{{ operator.address }}</p><p>Summer and winter activities, mountain courses and private guiding.</p></div><div class="site-explore__links"><UButton to="/contact" color="neutral" label="Plan your activity" /><a :href="`tel:${operator.telephone}`">{{ operator.phoneLabel }}</a><a :href="`mailto:${operator.email}`">{{ operator.email }}</a><a href="https://wa.me/41796526000" target="_blank" rel="noopener noreferrer">WhatsApp +41 79 652 60 00 ↗</a></div></section>
  </UContainer>
</template>
<script setup lang="ts">
import { operator } from '~/content/operator'
</script>
<style scoped>
.site-explore { padding-block: 1rem 5rem; }
.site-explore__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.site-explore__contact { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; padding: clamp(24px, 5vw, 64px); margin-top: 56px; border-radius: 24px; background: #e4e8e1; }
.site-explore h2 { font: 400 clamp(32px, 5vw, 56px)/1.15 Georgia, serif; letter-spacing: -.035em; margin-block: 1rem; }
.site-explore p { font-size: 14px; line-height: 1.8; }
.site-explore__kicker { font-size: 10px !important; letter-spacing: .14em; text-transform: uppercase; }
.site-explore__links { display: flex; flex-direction: column; align-items: start; justify-content: center; gap: 16px; font-size: 14px; }
@media(max-width:700px) { .site-explore__grid, .site-explore__contact { grid-template-columns: 1fr; } }
</style>
