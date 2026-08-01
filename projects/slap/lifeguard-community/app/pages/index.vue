<template>
  <main class="community-page community-home">
    <section class="community-hero">
      <div class="community-hero__copy">
        <p class="community-kicker">Led by Nick · details to be confirmed</p>
        <h1>A community for lifeguards.</h1>
        <p class="community-intro">Discuss day-to-day professional practice with other members. Join extracurricular community programmes and keep track of your participation.</p>
        <div class="community-hero__actions">
          <UButton to="/forum" size="xl">Join the discussion</UButton>
          <UButton to="/training" size="xl" variant="outline">Explore programmes</UButton>
        </div>
      </div>
      <figure class="community-hero__media">
        <img src="/img/app/lifeguard-community/community-crew-hero.png" alt="Lifeguard colleagues standing together by calm water">
      </figure>
    </section>
    <div class="community-grid">
      <section class="community-card"><h2>Forum</h2><p>Member discussion spaces for daily practice and team routines.</p><NuxtLink to="/forum">Visit the forum</NuxtLink></section>
      <section class="community-card"><h2>Training</h2><p>Extracurricular, community-led programmes with recorded participation criteria.</p><NuxtLink to="/training">Explore programmes</NuxtLink></section>
      <section class="community-card"><h2>Merchandise</h2><p>See community items and eligibility after verified programme completion.</p><NuxtLink to="/merchandise">See merchandise</NuxtLink></section>
    </div>
    <aside class="community-notice"><strong>Important boundary:</strong> this is not an official lifeguard training, certification, emergency-guidance, regulatory, or employment-qualification service. Follow your employer and recognised training body for operational requirements.</aside>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Lifeguard Community', description: 'A member community for lifeguard discussion and extracurricular learning.' })
</script>
