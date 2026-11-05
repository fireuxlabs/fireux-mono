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
          Core, Blogs and Products with your selected Ecosystem’s Firebase
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
