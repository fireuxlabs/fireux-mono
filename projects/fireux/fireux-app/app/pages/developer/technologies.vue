<template>
  <div class="technologies-page">
    <h1>Technologies Used</h1>
    <p>
      This project is built with a carefully selected set of modern technologies
      to deliver a robust, scalable, and maintainable application. Below are the
      core technologies currently in use.
    </p>
    <ul class="tech-list">
      <li>
        <Icon name="skill-icons:nuxtjs-dark" class="list-icon" />
        <strong>Nuxt 4</strong>: The latest version of the Nuxt framework,
        providing SSR, routing, and modular development for Vue applications.
      </li>
      <li>
        <Icon name="vscode-icons:file-type-firebase" class="list-icon" />
        <strong>Firebase</strong>: Authentication, Firestore database, and
        serverless functions for backend and real-time features.
      </li>
      <li>
        <Icon name="logos:stripe" class="list-icon" />
        <strong>Stripe</strong>: Payment processing and subscription management.
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
  font-size: 1.1rem;
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
