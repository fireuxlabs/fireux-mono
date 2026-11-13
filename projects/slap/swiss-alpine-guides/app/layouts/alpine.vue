<template>
  <div class="alpine-shell">
    <a class="alpine-skip" href="#content">Skip to content</a>
    <NavigationHeader />
    <slot />
    <footer class="alpine-footer">
      <span>SWISS ALPINE GUIDES</span>
      <p>{{ operator.address }}<br /><a :href="`tel:${operator.telephone}`">{{ operator.phoneLabel }}</a><br /><a :href="`mailto:${operator.email}`">{{ operator.email }}</a></p>
      <nav class="alpine-footer__links" aria-label="Footer navigation"><NuxtLink to="/activities">All activities</NuxtLink><NuxtLink to="/summer">Summer</NuxtLink><NuxtLink to="/winter">Winter</NuxtLink><NuxtLink to="/courses">Courses</NuxtLink><NuxtLink to="/rentals">Rentals</NuxtLink><NuxtLink to="/vouchers">Vouchers</NuxtLink><NuxtLink to="/about">About</NuxtLink><NuxtLink to="/news">Programme updates</NuxtLink><NuxtLink to="/resources">Resources</NuxtLink><NuxtLink to="/terms">Terms</NuxtLink><NuxtLink to="/contact">Contact</NuxtLink></nav>
      <small
        >Client review prototype · Opening mountain animation is AI-generated. Activity photographs and programme references come from the original operator website. Current arrangements require operator confirmation.</small
      >
    </footer>
  </div>
</template>
<script setup lang="ts">
import { operator } from '~/content/operator'
</script>
<style scoped>
.alpine-shell {
  background: #f3f3ef;
  color: #142d35;
  min-height: 100svh;
}
.alpine-skip {
  position: fixed;
  top: -100px;
  left: 16px;
  background: white;
  color: #142d35;
  padding: 12px;
  z-index: 100;
}
.alpine-skip:focus {
  top: 10px;
}
.alpine-footer {
  padding: 50px clamp(24px, 6vw, 96px) 30px;
  background: #142d35;
  color: #e3e9e6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  font-size: 12px;
}
.alpine-footer > span {
  font-size: 11px;
  letter-spacing: 0.15em;
}
.alpine-footer > p {
  grid-column: 1;
  font-size: 11px;
  color: #b3c3c3;
}
.alpine-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  grid-column: 2;
  grid-row: 1/3;
  align-self: center;
  justify-self: end;
}
.alpine-footer small {
  grid-column: 1/-1;
  border-top: 1px solid #ffffff20;
  padding-top: 25px;
  margin-top: 15px;
  font-size: 9px;
  color: #adbfbd;
  line-height: 1.6;
}
@media (max-width: 640px) {
  .alpine-footer {
    grid-template-columns: 1fr;
  }
  .alpine-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
    grid-row: auto;
    grid-column: 1;
    justify-self: start;
    margin: 12px 0;
  }
}
</style>
