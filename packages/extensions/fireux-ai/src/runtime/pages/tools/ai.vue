<template>
  <UContainer class="sm:py-14">
    <div class="mx-auto grid max-w-5xl gap-8">
      <header class="grid gap-3">
        <NuxtLink to="/tools" class="w-fit hover:underline">Tools</NuxtLink>
        <h1 class="m-0 fx-type-page-title">AI primitives</h1>
        <p class="m-0 max-w-3xl">
          FireUX AI turns supplied content into schema-checked information.
          Owning packages provide the domain instructions and decide what may be
          saved.
        </p>
      </header>
      <div class="grid gap-4">
        <UCard
          v-for="primitive in aiToolPrimitives"
          :id="primitive.documentation.slug"
          :key="primitive.id"
          class="grid gap-4" as="article" :ui="{ body: 'fx-card-body-stack' }"
        >
          <header class="grid gap-1">
            <h2 class="m-0 fx-type-section-title">
              {{ primitive.name }}
            </h2>
            <p class="m-0">{{ primitive.description }}</p>
            <code>{{ primitive.id }}</code>
          </header>
          <div class="grid gap-1">
            <strong>Problem</strong>
            <span>{{ primitive.problem }}</span>
          </div>
          <div class="grid gap-1">
            <strong>Search intent</strong>
            <ul class="m-0 grid gap-1 pl-5">
              <li
                v-for="intent in primitive.searchIntents"
                :key="`${intent.kind}:${intent.phrase}`"
              >
                {{ intent.phrase }}
                <span>({{ intent.kind }}, {{ intent.status }})</span>
              </li>
            </ul>
          </div>
          <p class="m-0">
            {{ primitive.documentation.guide }}
          </p>
          <div class="grid gap-1">
            <strong>AI context</strong>
            <span>{{ primitive.ai.baked.purpose }}</span>
            <span>
              Runtime required:
              {{ primitive.ai.runtime.required.join(', ') || 'none' }} ·
              optional:
              {{ primitive.ai.runtime.optional.join(', ') || 'none' }}
            </span>
          </div>
          <pre
            class="overflow-x-auto rounded-lg bg-elevated p-4"
          ><code>{{ primitive.documentation.example }}</code></pre>
        </UCard>
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
