<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto grid max-w-4xl gap-10">
        <header class="grid max-w-3xl gap-3">
          <NuxtLink
            to="/tools"
            class="w-fit text-sm font-semibold text-primary hover:underline"
          >
            Tools
          </NuxtLink>
          <h1 class="m-0 text-3xl font-semibold text-highlighted sm:text-4xl">
            FireUX Core primitives
          </h1>
          <p class="m-0 text-base leading-7 text-muted">
            Shared capability contracts and server building blocks that packages
            specialize and compose.
          </p>
        </header>

        <div class="grid gap-4">
          <!-- TODO: Consider optional disclosure controls only when the Core catalogue is long enough to make scanning difficult. -->
          <article
            v-for="primitive in coreToolPrimitives"
            :id="primitive.documentation.slug"
            :key="primitive.id"
            class="scroll-mt-6 rounded-lg border border-default"
          >
            <header class="grid gap-1 p-4">
              <h2 class="m-0 text-lg font-semibold text-highlighted">
                {{ primitive.name }}
              </h2>
              <p class="m-0 text-sm text-muted">
                {{ primitive.description }}
              </p>
              <code class="text-xs text-dimmed">
                {{ primitive.id }}
              </code>
              <span class="text-xs text-dimmed">
                Capability family: {{ primitive.family }}
              </span>
            </header>

            <div class="grid gap-6 border-t border-default p-4">
              <div class="grid gap-2">
                <h3 class="m-0 text-base font-semibold text-highlighted">
                  Problem
                </h3>
                <p class="m-0 text-sm leading-6 text-toned">
                  {{ primitive.problem }}
                </p>
              </div>

              <div class="grid gap-2">
                <h3 class="m-0 text-base font-semibold text-highlighted">
                  Search intent
                </h3>
                <ul class="m-0 grid gap-1 pl-5 text-sm text-toned">
                  <li
                    v-for="searchIntent in primitive.searchIntents"
                    :key="`${searchIntent.kind}:${searchIntent.phrase}`"
                  >
                    {{ searchIntent.phrase }}
                    <span class="text-dimmed">
                      ({{ searchIntent.kind }}, {{ searchIntent.status }})
                    </span>
                  </li>
                </ul>
              </div>

              <div class="grid gap-2">
                <h3 class="m-0 text-base font-semibold text-highlighted">
                  AI context
                </h3>
                <p class="m-0 text-sm leading-6 text-toned">
                  {{ primitive.ai.baked.purpose }}
                </p>
                <p class="m-0 text-xs leading-5 text-dimmed">
                  Runtime required:
                  {{ primitive.ai.runtime.required.join(', ') || 'none' }} ·
                  optional:
                  {{ primitive.ai.runtime.optional.join(', ') || 'none' }}
                </p>
                <ul class="m-0 grid gap-1 pl-5 text-sm text-toned">
                  <li
                    v-for="constraint in primitive.ai.baked.constraints"
                    :key="constraint"
                  >
                    {{ constraint }}
                  </li>
                </ul>
              </div>

              <div class="grid gap-2">
                <h3 class="m-0 text-base font-semibold text-highlighted">
                  When to use it
                </h3>
                <p class="m-0 text-sm leading-6 text-toned">
                  {{ primitive.documentation.guide }}
                </p>
              </div>

              <div class="grid gap-2">
                <h3 class="m-0 text-base font-semibold text-highlighted">
                  Import
                </h3>
                <pre
                  class="overflow-x-auto rounded-lg bg-elevated p-4 text-sm"
                ><code>{{ importExample(primitive) }}</code></pre>
              </div>

              <div class="grid gap-2">
                <h3 class="m-0 text-base font-semibold text-highlighted">
                  Example
                </h3>
                <pre
                  class="overflow-x-auto rounded-lg bg-elevated p-4 text-sm"
                ><code>{{ primitive.documentation.example }}</code></pre>
              </div>

              <p class="m-0 text-xs leading-5 text-dimmed">
                Execution: {{ primitive.execution.environment }} · authorization
                {{ primitive.execution.authorization }} · confirmation
                {{ primitive.execution.confirmation }}. Human surface:
                {{ primitive.surfaces.human ? 'yes' : 'no' }} · AI surface:
                {{ primitive.surfaces.ai ? 'yes' : 'no' }}.
              </p>

              <p class="m-0 text-xs leading-5 text-dimmed">
                Authorize the request and choose an owner-controlled target
                before using this primitive. Core does not decide domain
                ownership.
              </p>
            </div>
          </article>
        </div>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { coreToolPrimitives } from '../../tools/catalogue'
import type { FireuxPrimitiveDefinition } from '../../tools/types'
import { useSeo } from '../../composables/fireux/seo/useSeo'

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
