<template>
  <UCard
    variant="subtle"
    class="w-full"
  >
    <div class="space-y-4">
      <a
        href="https://go-qr.web.app"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted hover:text-highlighted"
      >
        <span>Powered by</span>
        <img
          src="https://go-qr.web.app/img/app/logo.svg"
          alt="Go QR"
          class="size-4"
        >
        <span>Go QR</span>
      </a>

      <slot />
    </div>
  </UCard>
</template>
