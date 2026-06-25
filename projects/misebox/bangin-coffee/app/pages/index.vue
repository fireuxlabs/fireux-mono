<template>
  <UPage class="bangin-page">
    <main class="bangin-shell">
      <section class="bangin-hero">
        <div>
          <p class="bangin-kicker">{{ content.hero.eyebrow }}</p>
          <h1 class="bangin-title">{{ content.hero.title }}</h1>
          <p class="bangin-subtitle">
            {{ content.hero.subtitle }}
          </p>
          <p class="bangin-description">
            {{ content.hero.description }}
          </p>

          <div class="bangin-actions">
            <UButton
              :to="links.contactForm"
              target="_blank"
              color="primary"
              size="xl"
              icon="i-lucide-calendar-check"
            >
              Book the bar
            </UButton>
            <UButton
              to="/contact"
              color="neutral"
              variant="soft"
              size="xl"
              icon="i-lucide-message-circle"
            >
              Contact
            </UButton>
          </div>
        </div>

        <aside class="bangin-roast-card">
          <div class="bangin-roast-orbit">
            <div class="bangin-roast-mark">BC</div>
          </div>
          <UPageCard
            class="mt-4"
            variant="subtle"
            :title="content.roast.title"
            :description="content.roast.body"
          />
        </aside>
      </section>

      <section class="bangin-card-grid" aria-label="Bangin Coffee services">
        <UPageCard
          v-for="card in content.cards"
          :key="card.title"
          class="bangin-card"
          :title="card.title"
          :description="card.description"
          :icon="card.icon"
        />
      </section>
    </main>
  </UPage>
</template>

<script setup lang="ts">
import { banginCoffeeContent as content, banginCoffeeLinks as links } from '../config/content.config'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Bangin Coffee',
  description:
    'Mobile coffee bar serving in-house roasted coffee for weddings, corporate events, festivals, and private parties.',
})
</script>
