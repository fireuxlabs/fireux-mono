<template>
  <UContainer>
    <div>
      <header>
        <NuxtLink to="/tools">Tools</NuxtLink>
        <h1 class="fx-type-page-title">AI primitives</h1>
        <p>
          FireUX AI turns supplied content into schema-checked information.
          Owning packages provide the domain instructions and decide what may be
          saved.
        </p>
      </header>
      <UPageGrid>
        <UCard
          v-for="primitive in aiToolPrimitives"
          :id="primitive.documentation.slug"
          :key="primitive.id"
          as="article"
          :ui="{ body: 'fx-card-body-stack' }"
        >
          <header class="fx-card-body-stack">
            <h2 class="fx-type-section-title">
              {{ primitive.name }}
            </h2>
            <p>{{ primitive.description }}</p>
            <code>{{ primitive.id }}</code>
          </header>
          <div class="fx-card-body-stack">
            <strong>Problem</strong>
            <span>{{ primitive.problem }}</span>
          </div>
          <div class="fx-card-body-stack">
            <strong>Search intent</strong>
            <ul>
              <li
                v-for="intent in primitive.searchIntents"
                :key="`${intent.kind}:${intent.phrase}`"
              >
                {{ intent.phrase }}
                <span>({{ intent.kind }}, {{ intent.status }})</span>
              </li>
            </ul>
          </div>
          <p>
            {{ primitive.documentation.guide }}
          </p>
          <div class="fx-card-body-stack">
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
            class="overflow-x-auto"
          ><code>{{ primitive.documentation.example }}</code></pre>
        </UCard>
      </UPageGrid>
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
