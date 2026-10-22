<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Getting started"
        description="Build an industry SaaS from shared application foundations, industry libraries and native Nuxt UI."
      />
      <UPageBody>
        <UAlert
          title="Working from source"
          description="FireUX currently lives in a source workspace. These guides describe its existing packages and starter App."
          icon="i-lucide-code-xml"
          color="neutral"
          variant="subtle"
        />
        <UPageGrid>
          <UPageCard
            title="1. Define the industry workflow"
            description="Identify the people, records and work your product supports. Use those responsibilities to choose its capabilities and Tools."
            icon="i-lucide-list-checks"
          />
          <UPageCard
            title="2. Reuse SaaS foundations"
            description="Compose App identity, membership, Workspace mechanics and shared editing and state patterns from FireUX Core."
            icon="i-lucide-layers-3"
            to="/packages/fireux-core"
          />
          <UPageCard
            title="3. Add industry libraries"
            description="Compose domain records, workflows and protected commands into your Apps and Ecosystem."
            icon="i-lucide-boxes"
            to="/packages"
          />
        </UPageGrid>
        <UPageCard
          title="Build with native Nuxt UI"
          description="Use Nuxt UI controls, accessibility, semantic tokens and theme APIs directly. FireUX adds shared application interactions around that foundation."
          icon="i-lucide-component"
        >
          <UButton
            to="/components"
            label="Explore shared interactions"
            color="neutral"
            variant="outline"
          />
          <UButton
            to="https://ui.nuxt.com/docs/getting-started"
            target="_blank"
            label="Nuxt UI documentation"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </UPageCard>
        <UPageCard
          id="starter"
          title="The starter App"
          description="The existing neutral skeleton declares App identity, native runtime layers and the domain modules it consumes."
          icon="i-lucide-panels-top-left"
        >
          <code>projects/templates/fireux-template</code>
          <UPageList>
            <UPageFeature
              title="Read the App configuration"
              description="Open the starter's nuxt.config.ts to inspect its identity, ecosystem, modules and native runtime layers."
              icon="i-lucide-file-code"
            />
            <UPageFeature
              title="Prepare the App's identity"
              description="Use the new App's approved identity and backend configuration. Replace the starter's placeholder brand and content."
              icon="i-lucide-fingerprint"
            />
            <UPageFeature title="Preview locally" icon="i-lucide-terminal">
              <template #description>
                From the repository root, run
                <code>pnpm --dir projects/templates/fireux-template dev</code>.
                The starter's development command uses port 3010.
              </template>
            </UPageFeature>
          </UPageList>
        </UPageCard>
        <UPageCard
          title="Reference documentation"
          description="Repository concepts and operating guidance remain available in the reference viewer."
          icon="i-lucide-book-open"
        >
          <UButton
            v-if="docsEnabled"
            to="/docs"
            label="Repository reference"
            color="neutral"
            variant="outline"
          />
          <p v-else class="fx-type-caption">
            The repository reference viewer is enabled in production and
            dedicated documentation development.
          </p>
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const docsEnabled = useRouter()
  .getRoutes()
  .some((route) => route.path === '/docs')

definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: {
    key: 'framework-docs',
    label: 'Docs',
    order: 10,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Getting started · FireUX',
  description:
    'Build industry SaaS with the FireUX source workspace, shared SaaS foundations, industry libraries and native Nuxt UI.',
})
</script>
