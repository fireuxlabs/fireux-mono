<template>
  <div class="technologies-page">
    <h1 class="fx-type-page-title">FireUX technologies</h1>
    <p class="fx-type-description">
      FireUX Apps use one shared Nuxt runtime and explicit Firebase bindings.
      Extension Modules add capability at build time.
    </p>
    <ul class="fx-type-description tech-list text-default">
      <li>
        <Icon name="skill-icons:nuxtjs-dark" class="list-icon" />
        <strong>Nuxt 4</strong>: App routing, server rendering, and Module
        composition.
      </li>
      <li>
        <Icon name="vscode-icons:file-type-firebase" class="list-icon" />
        <strong>Firebase</strong>: Authentication, named Firestore databases,
        Hosting, and server-side infrastructure.
      </li>
      <li>
        <Icon name="logos:stripe" class="list-icon" />
        <strong>Stripe</strong>: Checkout support for configured product
        Modules.
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// No script needed for this simple technologies page
</script>

<style scoped>
.technologies-page {
  max-width: 700px;
  margin: 0 auto;
  padding: calc(var(--spacing) * 8);
}
.tech-list {
  margin-top: calc(var(--spacing) * 8);
  padding-left: calc(var(--spacing) * 6);
}
.tech-list li {
  margin-bottom: calc(var(--spacing) * 3);
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
.list-icon {
  width: 1.5em;
  height: 1.5em;
  vertical-align: middle;
}
</style>
