<template>
  <div class="pointer-events-none absolute inset-0 z-20">
    <div
      class="pointer-events-auto absolute inset-x-0 top-1/4 z-[2] flex -translate-y-1/2 justify-center"
    >
      <NuxtLink
        class="latap-glass flex min-h-[4.25rem] cursor-pointer items-center justify-start gap-3 rounded-2xl px-4 py-3"
        to="/menus"
      >
        <UIcon name="i-ph-fork-knife" class="size-5 shrink-0" />
        <span class="grid min-w-32 gap-0.5 text-left">
          <span class="text-sm font-black uppercase leading-none tracking-wider">
            View menu
          </span>
          <small class="font-serif text-sm font-semibold italic leading-none opacity-[0.84]">
            Comida Casera
          </small>
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
