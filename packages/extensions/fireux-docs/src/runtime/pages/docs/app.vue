<template>
  <UPage>
    <UPageHeader
      title="app.vue"
      description="Choose the ordinary or Workspace root. Both share the FireUX App lifecycle."
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
        <p>Use this shared root in <code>app/app.vue</code>:</p>
        <UCard variant="subtle">
          <pre><code>{{ fireuxExample }}</code></pre>
        </UCard>

        <p>
          Core's <code>FireuxApp</code> supplies one <code>UApp</code>, normal
          page layouts and the shared App initialization, manifest, PWA status
          and robots metadata. Developer controls are included only in
          development.
        </p>
        <p>
          Each native layout owns one main content landmark around the page
          supplied by the root. Pages select the Workspace frame with
          <code>layout: 'workspace'</code>; Nuxt loads that layout
          asynchronously. Its shared page frame owns the Workspace landmark,
          Navbar, breadcrumbs and error boundary. Core serves the default App
          manifest. The optional Workspace layout supplies the Workspace
          manifest for its configured entrance.
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
            Use one <code>FireuxApp</code> root for every App. Do not repeat
            <code>UApp</code>, the route outlet or App initialization around it.
          </li>
          <li>
            Put route content in pages and shared navigation, headers and
            footers in layouts. Layouts consume their native slot.
          </li>
          <li>
            Pages using a layout consume its <code>main</code> landmark. A page
            with <code>layout: false</code> supplies its own <code>UMain</code>.
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
