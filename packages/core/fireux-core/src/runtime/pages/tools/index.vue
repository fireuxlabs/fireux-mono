<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto grid max-w-6xl gap-10">
        <header class="grid max-w-3xl gap-3">
          <NuxtLink
            to="/"
            class="w-fit text-sm font-semibold text-primary hover:underline"
          >
            {{ appName }}
          </NuxtLink>
          <h1 class="m-0 text-3xl font-semibold text-highlighted sm:text-4xl">
            Tools
          </h1>
          <p class="m-0 text-base leading-7 text-muted">
            See the primitives and compound tools provided by the packages
            installed in this App.
          </p>
        </header>

        <section class="grid gap-4" aria-labelledby="core-primitives-title">
          <div class="grid gap-1">
            <p
              class="m-0 text-xs font-semibold uppercase tracking-wide text-primary"
            >
              FireUX Core
            </p>
            <h2
              id="core-primitives-title"
              class="m-0 text-xl font-semibold text-highlighted"
            >
              Source primitives
            </h2>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UCard v-for="primitive in corePrimitives" :key="primitive.name">
              <h3 class="m-0 font-semibold text-highlighted">
                {{ primitive.name }}
              </h3>
              <p class="mt-1 text-sm text-muted">{{ primitive.description }}</p>
            </UCard>
          </div>
        </section>

        <section class="grid gap-4" aria-labelledby="package-tools-title">
          <div class="grid gap-1">
            <h2
              id="package-tools-title"
              class="m-0 text-xl font-semibold text-highlighted"
            >
              Installed package tools
            </h2>
            <p class="m-0 text-sm text-muted">
              Each package owns and explains the tools it provides.
            </p>
          </div>
          <div v-if="contributions.length" class="grid gap-3 sm:grid-cols-2">
            <UCard v-for="item in contributions" :key="item.to">
              <div class="grid gap-3">
                <div>
                  <UBadge color="neutral" variant="soft">{{
                    item.owner
                  }}</UBadge>
                  <h3 class="mt-2 font-semibold text-highlighted">
                    {{ item.title }}
                  </h3>
                  <p class="mt-1 text-sm text-muted">{{ item.description }}</p>
                </div>
                <UButton
                  :to="item.to"
                  color="neutral"
                  variant="soft"
                  class="w-fit"
                  >View tools</UButton
                >
              </div>
            </UCard>
          </div>
          <UAlert
            v-else
            color="neutral"
            variant="soft"
            title="No package tools installed"
          />
        </section>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

type ToolCatalogueMeta = { owner: string; title: string; description: string }

const fireux = useFireUXConfig()
const router = useRouter()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const corePrimitives = [
  {
    name: 'Accept an upload',
    description: 'Receive a bounded file from an authorized request.',
  },
  {
    name: 'Validate a file',
    description: 'Check its size, type, extension and required fields.',
  },
  {
    name: 'Classify a document',
    description: 'Identify an image, PDF or other document source.',
  },
  {
    name: 'Store a file',
    description:
      'Save an authorized file with an explicit storage path and policy.',
  },
  {
    name: 'Delete a stored file',
    description: 'Remove a stored source when its lifecycle is complete.',
  },
] as const

const contributions = computed(() =>
  router
    .getRoutes()
    .map((route) => ({
      to: route.path,
      catalogue: (route.meta as Record<string, unknown>).toolCatalogue as
        | ToolCatalogueMeta
        | undefined,
    }))
    .filter((entry): entry is { to: string; catalogue: ToolCatalogueMeta } =>
      Boolean(entry.catalogue)
    )
    .map(({ to, catalogue }) => ({ to, ...catalogue }))
    .sort((a, b) => a.title.localeCompare(b.title))
)

definePageMeta({ layout: 'landing' })
</script>
