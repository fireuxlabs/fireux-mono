<template>
  <UCard
    variant="subtle"
    class="w-full rounded-[var(--radius-lg)] shadow-xl shadow-black/20 ring-1 ring-white/10"
  >
    <div class="space-y-5">
      <a
        href="https://go-qr.web.app"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-highlighted"
      >
        <AppBrandLogo
          size="small"
          alt="Go QR"
          class="size-4"
        />
        <span>Powered by Go QR</span>
      </a>

      <header
        v-if="title || description"
        class="space-y-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <h2
            v-if="title"
            class="text-lg font-semibold text-highlighted"
          >
            {{ title }}
          </h2>
          <UBadge
            v-if="endpoint"
            :label="endpoint"
            color="neutral"
            variant="soft"
          />
        </div>
        <p
          v-if="description"
          class="text-sm leading-6 text-muted"
        >
          {{ description }}
        </p>
      </header>

      <slot />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  endpoint?: string
}>()
</script>
