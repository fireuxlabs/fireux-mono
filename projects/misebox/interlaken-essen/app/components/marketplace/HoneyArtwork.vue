<template>
  <div
    class="market-honey-art"
    :class="{ 'market-honey-art--large': large }"
    role="img"
    :aria-label="alt"
  >
    <svg
      class="market-honey-art__landscape"
      viewBox="0 0 640 310"
      fill="none"
      aria-hidden="true"
    >
      <path d="M-24 257 92 157l59 49 98-133 77 112 55-66 73 102 67-75 143 111" />
      <path d="M-18 279c86-34 155-40 234-8 75 31 161 31 240-5 66-30 130-23 209 18" />
      <path d="M45 233c82-12 139-2 194 24 67 32 131 23 195-7 51-24 100-25 158-7" />
    </svg>

    <div class="market-honey-art__comb" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>

    <div class="market-honey-art__jars" aria-hidden="true">
      <div class="market-honey-jar market-honey-jar--small">
        <span class="market-honey-jar__lid" />
        <span class="market-honey-jar__glass">
          <span class="market-honey-jar__honey" />
          <span class="market-honey-jar__label">250 g</span>
        </span>
      </div>
      <div class="market-honey-jar market-honey-jar--large">
        <span class="market-honey-jar__lid" />
        <span class="market-honey-jar__glass">
          <span class="market-honey-jar__honey" />
          <span class="market-honey-jar__label">500 g</span>
        </span>
      </div>
    </div>

    <span class="market-honey-art__seal" aria-hidden="true">
      <UIcon name="i-lucide-hexagon" />
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    alt: string
    large?: boolean
  }>(),
  {
    large: false,
  }
)
</script>
