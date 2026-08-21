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
          <ul class="m-0 grid gap-4 p-0">
            <li
              v-for="primitive in corePrimitives"
              :key="primitive.id"
              class="list-none"
            >
              <NuxtLink
                :to="`/tools/core#${primitive.documentation.slug}`"
                class="group flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-elevated"
              >
                <span>
                  <span class="block font-semibold text-highlighted">
                    {{ primitive.name }}
                  </span>
                  <span class="mt-1 block text-sm text-muted">
                    {{ primitive.description }}
                  </span>
                </span>
                <span
                  class="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                >
                  Open
                  <UIcon name="i-lucide-arrow-right" class="size-4" />
                </span>
              </NuxtLink>
            </li>
          </ul>
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
          <ul v-if="contributions.length" class="m-0 grid gap-4 p-0">
            <li v-for="item in contributions" :key="item.to" class="list-none">
              <NuxtLink
                :to="item.to"
                class="group flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-elevated"
              >
                <span>
                  <span class="block font-semibold text-highlighted">
                    {{ item.title }}
                  </span>
                  <span class="mt-1 block text-sm text-muted">
                    {{ item.description }}
                  </span>
                </span>
                <span
                  class="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                >
                  Open
                  <UIcon name="i-lucide-arrow-right" class="size-4" />
                </span>
              </NuxtLink>
            </li>
          </ul>
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
import { coreToolPrimitives } from '../../tools/catalogue'

type ToolCatalogueMeta = { owner: string; title: string; description: string }

const fireux = useFireUXConfig()
const router = useRouter()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const corePrimitives = coreToolPrimitives

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
