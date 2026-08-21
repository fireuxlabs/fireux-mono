<template>
  <div class="min-h-screen bg-[var(--ui-bg)]">
    <main class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <slot />
    </main>

    <footer class="border-t border-default bg-[var(--ui-bg)]/80">
      <div
        class="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 text-xs text-dimmed sm:px-6"
      >
        <span>Misebox</span>
        <span>Kitchen Menu</span>
      </div>
    </footer>
  </div>
</template>
