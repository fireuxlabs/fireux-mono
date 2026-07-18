<template>
  <div class="developer-landing">
    <h1>Developer Technologies & Skills</h1>
    <p>
      This project is powered by a focused set of core technologies, providing
      the foundation for all features and capabilities. Supporting these are a
      range of skills and tools that enable rapid development, maintainability,
      and a great user experience.
    </p>
    <h2>Core Technologies</h2>
    <ul class="skills-list">
      <li>
        <Icon name="skill-icons:nuxtjs-dark" class="list-icon" />
        <NuxtLink to="/developer/technologies#nuxt-4">Nuxt 4</NuxtLink> – The
        backbone of the app, enabling SSR, routing, and modular Vue development.
      </li>
      <li>
        <Icon name="vscode-icons:file-type-firebase" class="list-icon" />
        <NuxtLink to="/developer/technologies#firebase">Firebase</NuxtLink> –
        Authentication, database, and serverless backend for real-time features.
      </li>
      <li>
        <Icon name="logos:stripe" class="list-icon" />
        <NuxtLink to="/developer/technologies#stripe">Stripe</NuxtLink> – Secure
        payment processing and subscription management.
      </li>
    </ul>
    <h2>Supporting Skills</h2>
    <ul class="skills-list">
      <li>
        <Icon name="skill-icons:tailwindcss-dark" class="list-icon" />
        <NuxtLink to="/developer/skills#tailwind-css">Tailwind CSS</NuxtLink> –
        Utility-first styling for rapid UI development
      </li>
      <li>
        <Icon name="skill-icons:sass" class="list-icon" />
        <NuxtLink to="/developer/skills#scss">SCSS</NuxtLink> – Advanced styling
        and design system
      </li>
      <li>
        <Icon name="logos:pwa" class="list-icon" />
        <NuxtLink to="/developer/skills#pwa">PWA</NuxtLink> – Offline support,
        installability
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
    <p class="more-info">
      <NuxtLink to="/developer/technologies"
        >Learn more about the core technologies</NuxtLink
      >
      or
      <NuxtLink to="/developer/skills">explore all supporting skills</NuxtLink>
      in detail.
    </p>
    <p class="dev-link">
      Need raw JSON payloads instead of documentation? Head to the
      <NuxtLink to="/dev">Dev Tools</NuxtLink> stack for clipboard-ready
      registry snapshots.
    </p>
  </div>
</template>

<script setup lang="ts">
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
.more-info {
  margin-top: calc(var(--spacing) * 8);
  font-size: 1.05rem;
}
.dev-link {
  margin-top: calc(var(--spacing) * 4);
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
}
</style>
