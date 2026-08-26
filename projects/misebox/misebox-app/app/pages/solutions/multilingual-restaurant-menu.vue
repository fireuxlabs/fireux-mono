<template>
  <SolutionPage :solution="solution">
    <ProviderSproochliMenuTool
      public-menu-url="https://misebox.app/kitchens/la-tapberne/menus/main"
      kitchen-slug="la-tapberne"
      menu-id="main"
      source-language="de"
      target-languages="en, fr, it"
    />
    <SolutionInstructions :items="solution.instructions" />
    <SolutionIntegrations :integrations="solution.integrations" />
    <SolutionUpgrades :items="solution.upgrades" />
    <SolutionDev :dev="solution.dev" />
  </SolutionPage>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'landing',
})

const sproochliBaseUrl = import.meta.dev
  ? 'http://localhost:3011'
  : 'https://sproochli.web.app'

const solution = {
  title: 'Multilingual restaurant menu',
  description:
    'Prepare public menu translations with Sproochli while Misebox keeps menu truth.',
  instructions: [
    {
      title: 'Choose menu',
      icon: 'i-lucide-utensils',
      body: 'Start from a published Misebox public menu URL.',
    },
    {
      title: 'Choose languages',
      icon: 'i-lucide-languages',
      body: 'Select the source language and the target languages for Sproochli.',
    },
    {
      title: 'Review',
      icon: 'i-lucide-check-check',
      body: 'Sproochli owns the translation workflow; Misebox keeps menu, dish, and publish truth.',
    },
  ],
  integrations: {
    body: 'This is the Misebox packaging of the Sproochli menu translation primitive.',
    items: [
      {
        name: 'Sproochli',
        icon: 'i-lucide-languages',
        body: 'Provides the generic menu translation workbench.',
        cta: 'Open primitive',
        to: `${sproochliBaseUrl}/tools/menu`,
        external: true,
      },
      {
        name: 'Misebox',
        icon: 'i-lucide-utensils',
        body: 'Owns kitchen menu data, public menu URLs, dishes, and publishing.',
      },
    ],
  },
  upgrades: [
    'Read menu data through an explicit Misebox endpoint.',
    'Save reviewed translations back to menu/dish translation fields or cache rows.',
    'Add translation job status once Sproochli generation is ready.',
  ],
  dev: {
    endpoints: [
      {
        method: 'GET',
        path: 'Sproochli /tools/menu',
        description:
          'Embeds the Sproochli menu translation tool with Misebox menu labels.',
      },
      {
        method: 'GET',
        path: 'Sproochli /api/tools/menu',
        description: 'Returns the Sproochli menu tool contract.',
      },
    ],
  },
}

useSeo({
  title: `${solution.title} - Misebox`,
  description: solution.description,
  path: '/solutions/multilingual-restaurant-menu',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})
</script>
