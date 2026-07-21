<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: use Nuxt UI columns for the shared profile editor. -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: give preview and public fields a stable responsive hierarchy. -->
<template>
  <div
    class="grid min-w-0 gap-6 xl:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] xl:items-start"
  >
    <div class="min-w-0 xl:sticky xl:top-6">
      <slot name="preview" />
    </div>

    <div class="min-w-0">
      <slot name="core" />
    </div>
  </div>
</template>
