<template>
  <div class="developer-landing">
    <h1 class="fx-type-page-title">How FireUX Apps are built</h1>
    <p class="fx-type-description">
      FireUX Core owns the shared runtime. Ecosystem packages bind product
      authority, and Apps explicitly compose the Modules they need.
    </p>
    <h2 class="fx-type-section-title text-2xl">Runtime</h2>
    <ul class="fx-type-description skills-list text-default">
      <li>
        <Icon name="skill-icons:nuxtjs-dark" class="list-icon" />
        <NuxtLink to="/developer/technologies#nuxt-4">Nuxt 4</NuxtLink> – The
        shared App runtime for SSR, routing, and Vue components.
      </li>
      <li>
        <Icon name="vscode-icons:file-type-firebase" class="list-icon" />
        <NuxtLink to="/developer/technologies#firebase">Firebase</NuxtLink> –
        Authentication, named Firestore databases, Hosting, and server
        infrastructure.
      </li>
      <li>
        <Icon name="logos:stripe" class="list-icon" />
        <NuxtLink to="/developer/technologies#stripe">Stripe</NuxtLink> – Secure
        checkout support where a product Module configures it.
      </li>
    </ul>
    <h2 class="fx-type-section-title text-2xl">Implementation</h2>
    <ul class="fx-type-description skills-list text-default">
      <li>
        <Icon name="skill-icons:tailwindcss-dark" class="list-icon" />
        <NuxtLink to="/developer/skills#tailwind-css">Tailwind CSS</NuxtLink> –
        semantic utility styling
      </li>
      <li>
        <Icon name="skill-icons:sass" class="list-icon" />
        <NuxtLink to="/developer/skills#scss">SCSS</NuxtLink> – scoped styling
        where a component needs it
      </li>
      <li>
        <Icon name="logos:pwa" class="list-icon" />
        <NuxtLink to="/developer/skills#pwa">PWA</NuxtLink> – installable App
        manifests and service-worker support
      </li>
      <li>
        <Icon name="skill-icons:javascript" class="list-icon" />
        <NuxtLink to="/developer/skills#javascript">JavaScript</NuxtLink> &
        <Icon name="skill-icons:typescript" class="list-icon" />
        <NuxtLink to="/developer/skills#typescript">TypeScript</NuxtLink> – Core
        scripting and type safety
      </li>
      <li>
        <Icon name="skill-icons:github-dark" class="list-icon" />
        <NuxtLink to="/developer/skills#github">GitHub</NuxtLink> – Version
        control
      </li>
      <li>
        <Icon name="skill-icons:css" class="list-icon" />
        <NuxtLink to="/developer/skills#css3">CSS3</NuxtLink> &
        <Icon name="skill-icons:html" class="list-icon" />
        <NuxtLink to="/developer/skills#html5">HTML5</NuxtLink> – Web standards
      </li>
      <li>
        <Icon name="vscode-icons:file-type-node" class="list-icon" />
        <NuxtLink to="/developer/skills#node-js">Node.js</NuxtLink> –
        Server-side logic
      </li>
    </ul>
    <p class="fx-type-body more-info text-default">
      <NuxtLink to="/developer/technologies"
        >Learn more about the core technologies</NuxtLink
      >
      or
      <NuxtLink to="/developer/skills">explore all supporting skills</NuxtLink>
      in detail.
    </p>
    <p class="dev-link fx-type-caption">
      Need raw JSON payloads instead of documentation? Head to the
      <NuxtLink to="/diagnostics">Dev Tools</NuxtLink> stack for clipboard-ready
      directory projection snapshots.
    </p>
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors.
// No script needed for this simple landing page
</script>

<style scoped>
.developer-landing {
  max-width: 700px;
  margin: 0 auto;
  padding: calc(var(--spacing) * 8);
}
.skills-list {
  margin-top: calc(var(--spacing) * 6);
  padding-left: calc(var(--spacing) * 6);
}
.skills-list li {
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
.more-info {
  margin-top: calc(var(--spacing) * 8);
}
.dev-link {
  margin-top: calc(var(--spacing) * 4);
  color: var(--ui-text-muted);
}
</style>
