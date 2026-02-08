<template>
  <main class="ecosystem-doc">
    <header>
      <p class="eyebrow">Developer Docs</p>
      <h1>Create A New FireUX Ecosystem</h1>
      <p>
        This page is the canonical quick-start for creating a new ecosystem and
        wiring Firebase in the correct places.
      </p>
    </header>

    <section class="content">
      <h2>Docs hierarchy</h2>
      <ul>
        <li>
          <strong>/ecosystems</strong>: create a new ecosystem and wire Firebase
          project-level config.
        </li>
        <li>
          <strong>/apps</strong>: create global or tenant apps under an ecosystem.
        </li>
      </ul>

      <h2>1. Create Firebase Project</h2>
      <ol>
        <li>Create a new Firebase project.</li>
        <li>Enable Authentication, Firestore, and Storage.</li>
        <li>Create a Web App for your global app.</li>
        <li>
          Save these values from Firebase Web config:
          <code>apiKey</code>, <code>authDomain</code>, <code>projectId</code>,
          <code>storageBucket</code>, <code>messagingSenderId</code>,
          <code>appId</code>, optional <code>measurementId</code>.
        </li>
        <li>Create a service account key JSON for local admin/server tasks.</li>
      </ol>

      <h2>2. Create Ecosystem Package</h2>
      <p>Use this package shape:</p>
      <ul>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/package.json</code></li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/registry.json</code></li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/README.md</code></li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/docs/</code></li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/.firebaserc</code></li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/tsconfig.json</code></li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/src/module.ts</code></li>
        <li>
          <code>packages/ecosystem/fireux-&lt;ecosystem&gt;/src/config/firebase/ecosystem.config.ts</code>
        </li>
        <li>
          <code>packages/ecosystem/fireux-&lt;ecosystem&gt;/src/config/firebase/service-account.json</code>
          (local only, do not commit)
        </li>
        <li><code>packages/ecosystem/fireux-&lt;ecosystem&gt;/src/runtime/public/</code></li>
      </ul>

      <h2>3. Place Firebase Values Correctly</h2>
      <ul>
        <li>
          Ecosystem firebase public config goes in
          <code>src/config/firebase/ecosystem.config.ts</code>.
        </li>
        <li>
          App web app id goes in app <code>.env</code>:
          <code>NUXT_FIREBASE_APP_ID</code>.
        </li>
        <li>
          Optional analytics id goes in app <code>.env</code>:
          <code>NUXT_FIREBASE_MEASUREMENT_ID</code>.
        </li>
        <li>
          Service account key file goes at
          <code>src/config/firebase/service-account.json</code>.
        </li>
      </ul>

      <h2>4. Create Global App</h2>
      <p>
        For full app scaffolding and app-level env/deploy configuration, continue to
        <NuxtLink to="/apps">/apps</NuxtLink>.
      </p>
      <ul>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/app/</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/public/</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/server/</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/nuxt.config.ts</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/package.json</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/tsconfig.json</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/firebase.json</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/.env</code></li>
      </ul>
      <p>
        Add ecosystem-level Firebase project binding at
        <code>projects/&lt;ecosystem&gt;/.firebaserc</code>.
      </p>
      <p>
        Do not place <code>.firebaserc</code> inside app folders under
        <code>projects/*/*</code>.
      </p>

      <h2>5. Nuxt Config Pattern</h2>
      <pre><code>export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: '&lt;ecosystem&gt;',
    id: '&lt;app-id&gt;',
    name: '&lt;App Name&gt;',
    shortName: '&lt;Short Name&gt;',
    role: 'global',
    modules: ['fireux-&lt;ecosystem&gt;'],
  })
)</code></pre>

      <h2>6. Local Credential Setup</h2>
      <p>
        Preferred local setup:
        <code>GOOGLE_APPLICATION_CREDENTIALS</code> points to
        <code>packages/ecosystem/fireux-&lt;ecosystem&gt;/src/config/firebase/service-account.json</code>.
      </p>
      <p>Alternatives: <code>FIREBASE_SERVICE_ACCOUNT_FILE</code> or <code>FIREBASE_SERVICE_ACCOUNT</code>.</p>

      <h2>7. Validate</h2>
      <ol>
        <li><code>pnpm guard</code></li>
        <li><code>pnpm typecheck:packages</code></li>
        <li><code>pnpm typecheck:apps</code></li>
        <li>Run app and verify <code>/dev</code> environment panel is healthy.</li>
      </ol>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FireUX Ecosystem Setup',
  description:
    'Developer documentation for creating a new ecosystem and wiring Firebase correctly.',
})

definePageMeta({
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    desktop: true,
    mobile: true,
  },
})
</script>

<style scoped>
.ecosystem-doc {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: grid;
  gap: 2rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

header h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 0.5rem;
}

header p {
  max-width: 70ch;
}

.content {
  display: grid;
  gap: 1.5rem;
  font-size: 1rem;
  line-height: 1.7;
}

.content ul,
.content ol {
  margin-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
}

.content code {
  background: rgba(148, 163, 184, 0.15);
  padding: 0.1em 0.3em;
  border-radius: 0.3em;
  font-size: 0.95em;
}

pre {
  margin: 0;
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.75rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.35);
}
</style>
