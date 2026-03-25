<template>
  <div class="relative min-h-[100dvh] bg-elevated/40">
    <UButton
      to="/"
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      aria-label="Close console entry"
      class="absolute left-4 top-4 z-10 sm:left-6 sm:top-6 lg:left-8 lg:top-8"
    />

    <div class="mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <div class="w-full">
        <slot />
      </div>
    </div>
  </div>
</template>
