<template>
  <UPage>
    <UPageHeader
      title="Tools"
      description="See the source primitives and compound tools provided by the packages installed in this App."
    >
      <template #headline>
        <ULink to="/">{{ appName }}</ULink>
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageSection
        title="Source primitives"
        description="The foundational tools provided by FireUX Core."
      >
        <UPageGrid>
          <UPageCard
            v-for="primitive in corePrimitives"
            :key="primitive.id"
            :title="primitive.name"
            :description="primitive.description"
            icon="i-lucide-wrench"
            :to="`/tools/core#${primitive.documentation.slug}`"
            variant="subtle"
          />
        </UPageGrid>
      </UPageSection>

      <UPageSection
        title="Installed package tools"
        description="Each package owns and explains the tools it provides."
      >
        <UPageGrid v-if="contributions.length">
          <UPageCard
            v-for="item in contributions"
            :key="item.to"
            :title="item.title"
            :description="item.description"
            icon="i-lucide-package"
            :to="item.to"
            variant="subtle"
          />
        </UPageGrid>
        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No package tools installed"
        />
      </UPageSection>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { coreToolPrimitives } from 'fireux-core/runtime/tools/catalogue'

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
