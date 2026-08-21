<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto grid max-w-5xl gap-8">
      <header class="grid gap-3">
        <NuxtLink
          to="/tools"
          class="w-fit text-sm font-semibold text-primary hover:underline"
          >Tools</NuxtLink
        >
        <h1 class="m-0 text-3xl font-semibold text-highlighted">
          AI primitives
        </h1>
        <p class="m-0 max-w-3xl text-muted">
          FireUX AI turns supplied content into schema-checked information.
          Owning packages provide the domain instructions and decide what may be
          saved.
        </p>
      </header>
      <div class="grid gap-4">
        <article
          v-for="primitive in aiToolPrimitives"
          :id="primitive.documentation.slug"
          :key="primitive.id"
          class="grid gap-4 rounded-lg border border-default p-4"
        >
          <header class="grid gap-1">
            <h2 class="m-0 font-semibold text-highlighted">
              {{ primitive.name }}
            </h2>
            <p class="m-0 text-sm text-muted">{{ primitive.description }}</p>
            <code class="text-xs text-dimmed">{{ primitive.id }}</code>
          </header>
          <div class="grid gap-1 text-sm text-toned">
            <strong class="text-highlighted">Problem</strong>
            <span>{{ primitive.problem }}</span>
          </div>
          <div class="grid gap-1 text-sm text-toned">
            <strong class="text-highlighted">Search intent</strong>
            <ul class="m-0 grid gap-1 pl-5">
              <li
                v-for="intent in primitive.searchIntents"
                :key="`${intent.kind}:${intent.phrase}`"
              >
                {{ intent.phrase }}
                <span class="text-dimmed"
                  >({{ intent.kind }}, {{ intent.status }})</span
                >
              </li>
            </ul>
          </div>
          <p class="m-0 text-sm leading-6 text-toned">
            {{ primitive.documentation.guide }}
          </p>
          <div class="grid gap-1 text-sm text-toned">
            <strong class="text-highlighted">AI context</strong>
            <span>{{ primitive.ai.baked.purpose }}</span>
            <span class="text-xs text-dimmed">
              Runtime required:
              {{ primitive.ai.runtime.required.join(', ') || 'none' }} ·
              optional:
              {{ primitive.ai.runtime.optional.join(', ') || 'none' }}
            </span>
          </div>
          <pre
            class="overflow-x-auto rounded-lg bg-elevated p-4 text-sm"
          ><code>{{ primitive.documentation.example }}</code></pre>
        </article>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { aiToolPrimitives } from '../../tools/catalogue'

definePageMeta({
  layout: 'landing',
  toolCatalogue: {
    owner: 'FireUX AI',
    title: 'AI primitives',
    description: 'Structured extraction primitives used by domain-owned tools.',
  },
})
</script>
