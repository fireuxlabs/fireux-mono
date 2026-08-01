<template>
  <div class="community-shell">
    <header class="community-header">
      <NuxtLink to="/" class="community-brand">Lifeguard Community</NuxtLink>
      <nav aria-label="Primary navigation">
        <NuxtLink to="/forum">Forum</NuxtLink>
        <NuxtLink to="/training">Training</NuxtLink>
        <NuxtLink to="/merchandise">Merchandise</NuxtLink>
        <NuxtLink :to="memberTarget">{{ isAuthenticated ? 'My community' : 'Join' }}</NuxtLink>
      </nav>
    </header>
    <NuxtPage />
    <footer class="community-footer">
      <p>Lifeguard Community · Placeholder identity pending Nick’s brand details.</p>
      <p>Community programmes are not certification, regulatory approval, employment qualification, or emergency guidance.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()
const memberTarget = computed(() => isAuthenticated.value ? '/member' : '/auth?redirect=%2Fmember')
</script>

<style>
:root { background: #f6fafb; }
.community-shell { min-height: 100svh; color: #102b35; background: #f6fafb; font-family: var(--font-sans); }
.community-header, .community-footer, .community-page { max-width: 74rem; margin: auto; padding-inline: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 12)); }
.community-header { min-height: calc(var(--spacing) * 20); display: flex; justify-content: space-between; align-items: center; gap: calc(var(--spacing) * 4); border-bottom: 1px solid #cbdde2; }
.community-brand { color: inherit; font-size: var(--text-base); font-weight: var(--font-weight-extrabold); letter-spacing: -.02em; text-decoration: none; }
.community-header nav { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 4); }
.community-header nav a { color: #264b57; font-size: var(--text-sm); text-decoration: none; }
.community-header nav a.router-link-active { color: #0b6b82; font-weight: var(--font-weight-bold); }
.community-footer { display: grid; gap: calc(var(--spacing) * 3); padding-block: calc(var(--spacing) * 10); color: #49636d; font-size: var(--text-xs); border-top: 1px solid #cbdde2; }
.community-page { padding-block: clamp(calc(var(--spacing) * 10), 7vw, calc(var(--spacing) * 24)); }
.community-kicker { margin: 0 0 calc(var(--spacing) * 3); color: #0b6b82; font-size: var(--text-xs); font-weight: var(--font-weight-extrabold); letter-spacing: .1em; text-transform: uppercase; }
.community-page h1 { max-width: 14ch; margin: 0; font-size: clamp(2.7rem, 7vw, 5.8rem); letter-spacing: -.06em; line-height: .92; }
.community-intro { max-width: 48rem; margin: calc(var(--spacing) * 6) 0 0; color: #38545e; font-size: var(--text-lg); line-height: 1.65; }
.community-hero { display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); align-items: center; gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 20)); }
.community-hero__actions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); margin-top: calc(var(--spacing) * 8); }
.community-hero__media { min-height: 31rem; margin: 0; overflow: hidden; border-radius: calc(var(--ui-radius) * 6); background: #c6dce1; }
.community-hero__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.community-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: calc(var(--spacing) * 4); margin-top: calc(var(--spacing) * 12); }
.community-card { padding: calc(var(--spacing) * 6); border: 1px solid #cbdde2; border-radius: calc(var(--ui-radius) * 4); background: white; }
.community-card h2, .community-card h3 { margin: 0 0 calc(var(--spacing) * 3); }
.community-card p { color: #49636d; line-height: 1.55; }
.community-card a { color: #0b6b82; font-weight: var(--font-weight-bold); }
.community-notice { max-width: 54rem; margin-top: calc(var(--spacing) * 8); padding: calc(var(--spacing) * 4) calc(var(--spacing) * 5); border-left: 4px solid #0b6b82; background: #e6f3f6; color: #254e5b; line-height: 1.55; }
@media (max-width: 760px) { .community-header { align-items: flex-start; flex-direction: column; padding-block: calc(var(--spacing) * 4); } .community-hero { grid-template-columns: 1fr; } .community-hero__media { min-height: 22rem; } }
</style>
