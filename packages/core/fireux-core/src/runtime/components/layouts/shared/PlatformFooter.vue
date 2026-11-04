<template>
  <div
    class="flex flex-col items-center justify-between gap-4 text-sm text-default sm:flex-row"
  >
    <nav
      aria-label="FireUX platform information"
      class="flex flex-wrap justify-center gap-x-4 gap-y-2"
    >
      <NuxtLink to="/legal" class="hover:underline">Legal</NuxtLink>
    </nav>
    <a
      href="https://fireux.app"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex shrink-0 items-center gap-2 hover:underline"
    >
      <img src="/img/core/brand/logo.svg" alt="" width="20" height="20" />
      <span>Built by FireUX</span>
    </a>
  </div>
</template>
