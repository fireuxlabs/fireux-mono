<template>
  <div class="market-section-index">
    <h1 :id="id">Choufe</h1>
    <p class="market-intro">Was suechsch?</p>

    <nav class="market-sections" aria-label="Agebots-Kategorie">
      <NuxtLink
        v-for="section in marketSections"
        :key="section.id"
        :to="`/choufe/${section.id}`"
        class="market-section-link"
      >
        <svg
          v-if="section.icon === 'cheese'"
          class="market-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M4 9.5 15.5 4 21 8v10H4Z" />
          <path d="M4 9.5h17" />
          <circle cx="9" cy="14" r="1.25" />
          <circle cx="16.5" cy="13.5" r="1" />
        </svg>
        <svg
          v-else-if="section.icon === 'hut'"
          class="market-section-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m3 11 9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
          <path d="M8 9h8" />
        </svg>
        <UIcon
          v-else
          :name="section.icon"
          class="market-section-icon"
          aria-hidden="true"
        />
        <span>
          <strong>{{ section.label }}</strong>
          <small>{{ section.description }}</small>
        </span>
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { marketSections } from '../../content/market-sections'

defineProps<{
  id?: string
}>()
</script>
