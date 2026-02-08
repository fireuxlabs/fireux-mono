<template>
  <main class="app-doc">
    <header>
      <p class="eyebrow">Developer Docs</p>
      <h1>Create A New FireUX App</h1>
      <p>
        App setup guide for global and tenant apps. For new Firebase projects
        and ecosystem package setup, use <NuxtLink to="/ecosystems">/ecosystems</NuxtLink>.
      </p>
    </header>

    <section class="content">
      <h2>1. Choose app type</h2>
      <ul>
        <li>
          Existing ecosystem app: create under <code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;</code>
          and reuse the ecosystem's Firebase project.
        </li>
        <li>
          New standalone product idea: create a new ecosystem first, then create
          the app under it. Use <NuxtLink to="/ecosystems">/ecosystems</NuxtLink>.
        </li>
      </ul>

      <h2>2. Required app shape</h2>
      <ul>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/app/</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/public/</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/server/</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/package.json</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/nuxt.config.ts</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/tsconfig.json</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/firebase.json</code></li>
        <li><code>projects/&lt;ecosystem&gt;/&lt;app-id&gt;/.env</code></li>
      </ul>
      <p>
        Place Firebase project selector at <code>projects/&lt;ecosystem&gt;/.firebaserc</code>,
        not inside the app folder.
      </p>

      <h2>3. Nuxt config baseline</h2>
      <pre><code>export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: '&lt;ecosystem&gt;',
    id: '&lt;app-id&gt;',
    name: '&lt;App Name&gt;',
    shortName: '&lt;Short Name&gt;',
    role: 'global', // or 'tenant'
    modules: [
      'fireux-&lt;ecosystem&gt;'
      // add extension modules only if needed
    ],
  })
)</code></pre>

      <h2>4. Dependencies</h2>
      <p>In app <code>package.json</code>, include:</p>
      <ul>
        <li><code>fireux-core</code></li>
        <li><code>fireux-&lt;ecosystem&gt;</code></li>
        <li>Required feature modules (examples: <code>fireux-drop</code>, <code>fireux-jobs</code>)</li>
      </ul>

      <h2>5. App .env keys</h2>
      <ul>
        <li><code>APP_DOMAIN</code></li>
        <li><code>NUXT_FIREBASE_APP_ID</code></li>
        <li><code>NUXT_FIREBASE_MEASUREMENT_ID</code> (optional)</li>
        <li><code>DEVELOPER_PIN</code> (optional)</li>
      </ul>
      <p>
        Firebase ecosystem keys (<code>apiKey</code>, <code>projectId</code>, etc.) stay in ecosystem config,
        not app <code>.env</code>.
      </p>

      <h2>6. Firebase deploy config baseline</h2>
      <pre><code>{
  "functions": [
    {
      "source": ".output/server",
      "codebase": "&lt;app-id&gt;-ssr",
      "runtime": "nodejs22",
      "entryPoint": "&lt;appIdCamelCase&gt;"
    }
  ],
  "hosting": {
    "site": "&lt;hosting-site-id&gt;",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "function": {
          "functionId": "&lt;appIdCamelCase&gt;",
          "codebase": "&lt;app-id&gt;-ssr",
          "region": "europe-west1"
        }
      }
    ]
  }
}</code></pre>

      <h2>7. Validate</h2>
      <ol>
        <li><code>pnpm guard</code></li>
        <li><code>pnpm typecheck:packages</code></li>
        <li><code>pnpm typecheck:apps</code></li>
        <li>Run app and check <code>/dev</code> for environment status.</li>
      </ol>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FireUX App Setup',
  description:
    'Developer documentation for creating a new FireUX app in an existing or new ecosystem.',
})

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-layout-dashboard',
    desktop: true,
    mobile: true,
  },
})
</script>

<style scoped>
.app-doc {
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
