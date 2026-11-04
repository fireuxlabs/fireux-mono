<template>
  <UPage>
    <UPageHeader
      title="App configuration"
      description="Set your App’s identity, connect it to an Ecosystem, and choose its FireUX packages."
    />

    <UPageBody>
      <UPageSection title="Configure FireUX">
        <p>
          In <code>nuxt.config.ts</code>, <code>defineFireuxConfig</code> wires
          up FireUX Core, Nuxt UI, and the selected Ecosystem’s Firebase setup.
          Your App declares its identity and the packages it uses.
        </p>
        <UCard variant="subtle">
          <pre><code>{{ example }}</code></pre>
        </UCard>
        <p>
          The <ULink to="/getting-started#starter">starter App</ULink> includes
          the Blogs and Products layers and enables the Products module.
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

const example = `import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  name: 'FireUX Template',
  role: 'tenant',
  modules: ['fireux-products'],
})`
</script>
