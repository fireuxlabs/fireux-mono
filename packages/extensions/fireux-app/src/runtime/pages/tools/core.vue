<template>
  <UPage>
    <UPageHeader
      title="FireUX Core primitives"
      description="Shared capability contracts and server building blocks that packages specialize and compose."
    >
      <template #links
        ><UButton to="/tools" label="Tools" color="neutral" variant="ghost"
      /></template>
    </UPageHeader>
    <UPageBody>
      <UPageCard
        v-for="primitive in coreToolPrimitives"
        :id="primitive.documentation.slug"
        :key="primitive.id"
        :title="primitive.name"
        :description="primitive.description"
      >
        <div class="fx-card-body-stack">
          <code>{{ primitive.id }}</code>
          <p>Capability family: {{ primitive.family }}</p>
          <UPageFeature title="Problem" :description="primitive.problem" />
          <section>
            <h3 class="fx-type-card-heading">Search intent</h3>
            <ul class="fx-list-stack">
              <li
                v-for="intent in primitive.searchIntents"
                :key="`${intent.kind}:${intent.phrase}`"
              >
                {{ intent.phrase }} ({{ intent.kind }}, {{ intent.status }})
              </li>
            </ul>
          </section>
          <section>
            <h3 class="fx-type-card-heading">AI context</h3>
            <p>{{ primitive.ai.baked.purpose }}</p>
            <p>
              Runtime required:
              {{ primitive.ai.runtime.required.join(', ') || 'none' }} ·
              optional: {{ primitive.ai.runtime.optional.join(', ') || 'none' }}
            </p>
            <ul class="fx-list-stack">
              <li
                v-for="constraint in primitive.ai.baked.constraints"
                :key="constraint"
              >
                {{ constraint }}
              </li>
            </ul>
          </section>
          <UPageFeature
            title="When to use it"
            :description="primitive.documentation.guide"
          />
          <section>
            <h3 class="fx-type-card-heading">Import</h3>
            <pre
              class="overflow-x-auto"
            ><code>{{ importExample(primitive) }}</code></pre>
          </section>
          <section>
            <h3 class="fx-type-card-heading">Example</h3>
            <pre
              class="overflow-x-auto"
            ><code>{{ primitive.documentation.example }}</code></pre>
          </section>
          <p>
            Execution: {{ primitive.execution.environment }} · authorization
            {{ primitive.execution.authorization }} · confirmation
            {{ primitive.execution.confirmation }}. Human surface:
            {{ primitive.surfaces.human ? 'yes' : 'no' }} · AI surface:
            {{ primitive.surfaces.ai ? 'yes' : 'no' }}.
          </p>
          <p>
            Authorize the request and choose an owner-controlled target before
            using this primitive. Core does not decide domain ownership.
          </p>
        </div>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { coreToolPrimitives } from 'fireux-core/runtime/tools/catalogue'
import type { FireuxPrimitiveDefinition } from 'fireux-core/runtime/tools/types'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const importExample = (primitive: FireuxPrimitiveDefinition) =>
  `import { ${primitive.implementation.exports.join(', ')} } from '${primitive.implementation.importPath}'`

useSeo({
  title: 'FireUX Core Capability Primitives',
  description:
    'Browse shared FireUX capability contracts and reusable Nuxt server primitives with TypeScript examples.',
  path: '/tools/core',
  jsonLdBuilder: ({ canonicalUrl, description, title }) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: canonicalUrl,
    name: title,
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: coreToolPrimitives.map((primitive, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: primitive.name,
        description: primitive.description,
        url: `${canonicalUrl}#${primitive.documentation.slug}`,
      })),
    },
  }),
})

definePageMeta({ layout: 'landing' })
</script>
