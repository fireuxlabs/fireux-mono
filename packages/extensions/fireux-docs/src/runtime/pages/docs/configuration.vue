<template>
  <UPage>
    <UPageHeader
      title="App configuration"
      description="Set your App’s identity, connect it to an Ecosystem, and choose its FireUX packages."
    />

    <UPageBody>
      <UPageSection title="Configure FireUX">
        <p>
          In <code>nuxt.config.ts</code>, <code>defineFireuxApp</code> composes
          Core, Blogs, Products and AI with your selected Ecosystem’s Firebase
          setup. Your App declares its identity and any extra packages it uses.
        </p>
        <UCard variant="subtle">
          <pre><code>{{ example }}</code></pre>
        </UCard>
        <p>
          The <ULink to="/getting-started#starter">starter App</ULink> includes
          the standard App bundle. There is no need to repeat its Blogs and
          Products modules or layers.
        </p>
        <p>
          For an Ecosystem Main App, use <code>defineFireuxEcosystem</code> from
          <code>fireux-ecosystem/config</code>. It includes the App bundle and
          adds shared Main App pages. Core can also be used on its own.
        </p>
      </UPageSection>

      <UPageSection title="Set your App’s identity">
        <ul class="fx-list-stack">
          <li>
            <code>ecosystem</code> selects the Ecosystem package and Firebase
            setup. <code>ecosystemId</code> identifies the Ecosystem record.
          </li>
          <li>
            <code>projectId</code> and <code>id</code> identify the Project and
            App. Set <code>role</code> to <code>global</code>,
            <code>tenant</code>, or <code>standalone</code>.
          </li>
        </ul>
      </UPageSection>

      <UPageSection id="app-assets" title="Add your artwork">
        <p>
          Each App owns eight files in <code>public/img/app/</code>. Replace the
          starter artwork with exports from your approved brand.
        </p>
        <ul class="fx-list-stack">
          <li><code>logo.png</code>: exactly 512×512.</li>
          <li>
            <code>wordmark-light.png</code> and <code>wordmark-dark.png</code>:
            matching canvases, at least 256×64 and at least 3:1.
          </li>
          <li><code>cover.png</code>: 16:9, at least 1280×720.</li>
          <li><code>thumbnail.png</code>: exactly 1200×630.</li>
          <li>
            <code>favicon.ico</code>: one ICO containing PNG images at 16, 32,
            48 and 64 pixels square.
          </li>
          <li>
            <code>pwa/icon-192.png</code> and <code>pwa/icon-512.png</code>:
            exactly 192×192 and 512×512.
          </li>
        </ul>
        <p>
          All files except the ICO are PNGs. Light and dark name the wordmark’s
          intended surface. Keep the same artwork and spacing in both.
        </p>
        <p>
          Open your App’s <ULink to="/assets">assets page</ULink> to review the
          files on light and dark backgrounds. From the repository root, run:
        </p>
        <UCard variant="subtle">
          <pre><code>pnpm check:assets</code></pre>
        </UCard>
        <p>
          Add an App directory to check just that App. CI, production App builds
          and release checks reject missing, corrupt or incorrectly sized files.
          Brand approval and visual contrast still need human review.
        </p>
      </UPageSection>

      <UPageSection title="Presentation">
        <p>
          Keep Nuxt UI settings, navigation and your optional semantic
          <code>theme</code> palette and typography in
          <code>app/app.config.ts</code>. Core uses that same theme for the
          browser theme colour and PWA manifest. Keep it out of
          <code>nuxt.config.ts</code>.
        </p>
      </UPageSection>

      <UPageSection title="Framework basics">
        <p>
          <ULink to="https://nuxt.com/docs/4.x/guide/going-further/layers">
            Nuxt layers</ULink
          >,
          <ULink to="https://nuxt.com/docs/guide/concepts/modules"
            >Nuxt modules</ULink
          >, and
          <ULink
            to="https://ui.nuxt.com/docs/getting-started/theme/design-system"
          >
            Nuxt UI theming</ULink
          >.
        </p>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'App configuration' })
useSeoMeta({
  title: 'App configuration · FireUX Docs',
  description: 'Set the identity, layers, and modules for a FireUX App.',
})

const example = `import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  shortName: 'Starter',
  context: 'A starter App built with FireUX.',
  role: 'tenant',
})`
</script>
