<template>
  <!-- Deprecated shim: now just a span to satisfy auto-import; real component is state/Field -->
  <span style="display: none" />
</template>
<script setup>
// Removed TS usage to avoid compiler-sfc type resolution error.
if (import.meta.dev) {
  console.warn(
    '[FireUX] FireMoleculesFormsStoreField is deprecated. Use FireMoleculesFormsStateField.'
  )
}
</script>
