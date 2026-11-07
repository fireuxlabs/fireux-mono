<template>
  <UPage>
    <UPageHeader
      title="app.vue"
      description="Keep the App root small. FireuxApp composes the shared FireUX lifecycle."
    />
    <UPageBody>
      <UPageSection title="The Nuxt foundation">
        <p>
          Nuxt uses <code>app/app.vue</code> as the root component. With pages
          and layouts, the usual composition is:
        </p>
        <UCard variant="subtle">
          <pre><code>{{ nuxtExample }}</code></pre>
        </UCard>
        <p>
          Nuxt UI adds <code>UApp</code> around that composition for shared UI
          services, including overlays and notifications.
        </p>
        <UCard variant="subtle">
          <pre><code>{{ uiExample }}</code></pre>
        </UCard>
      </UPageSection>
      <UPageSection title="What FireUX adds">
        <p>Use this in your App's <code>app/app.vue</code>:</p>
        <UCard variant="subtle">
          <pre><code>{{ fireuxExample }}</code></pre>
        </UCard>
        <p>
          Core's <code>FireuxApp</code> supplies one <code>UApp</code>, selects
          the normal layout or Workspace, and maintains the App initialization,
          manifest, PWA status and robots metadata. Developer controls are
          included only in development.
        </p>
        <p>
          Normal pages receive one <code>UMain</code> inside their layout. The
          Workspace frame owns its own main content landmark. Apps with no
          configured Workspaces do not load the Workspace frame. Nuxt still owns
          routing and layouts; Nuxt UI supplies the controls.
        </p>
      </UPageSection>
      <UPageSection title="Choose the entrance">
        <p>
          Use the existing FireUX configuration: <code>role</code> describes the
          App, <code>workspaces</code> lists its capabilities, and
          <code>homePath</code> supplies its public Home link. The native index
          route decides where a visitor arrives.
        </p>
        <p>
          Ecosystem Apps with Workspaces open the registered Workspace entrance.
          Their traditional landing remains at <code>/home</code>. FireUX keeps
          its public landing at <code>/</code>. Tenant and standalone Apps keep
          their own entrance.
        </p>
      </UPageSection>
      <UPageSection title="Keep these boundaries">
        <ul class="fx-list-stack">
          <li>
            Use one <code>FireuxApp</code>. Do not repeat <code>UApp</code>, the
            route outlet or App initialization around it.
          </li>
          <li>
            Put route content in pages and shared navigation, headers and
            footers in layouts. Layouts consume their native slot.
          </li>
          <li>
            Pages, layouts and their children do not add another
            <code>main</code> landmark.
          </li>
          <li>
            Declare identity, packages and Workspaces through App configuration.
            Keep presentation settings in <code>app.config.ts</code>.
          </li>
          <li>
            App-owned theme or language setup may stay in the root. Shared
            lifecycle changes belong in Core.
          </li>
          <li>
            A separate embedded entrance needs a deliberate route and lifecycle
            boundary. Go QR's tools entrance is the current exception.
          </li>
        </ul>
        <p>
          Continue with
          <ULink to="/docs/configuration">App configuration</ULink> and
          <ULink to="/docs/layouts">layouts</ULink>.
        </p>
      </UPageSection>
      <UPageSection title="Framework basics">
        <p>
          <ULink to="https://nuxt.com/docs/4.x/directory-structure/app/app"
            >Nuxt app.vue</ULink
          >
          ·
          <ULink to="https://ui.nuxt.com/docs/components/app"
            >Nuxt UI App</ULink
          >
        </p>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'app.vue' })
useSeoMeta({
  title: 'app.vue · FireUX Docs',
  description:
    'The FireUX App root, its Nuxt foundation and shared lifecycle boundaries.',
})
const nuxtExample = `<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>`
const uiExample = `<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>`
const fireuxExample = `<template>
  <FireuxApp />
</template>`
</script>
