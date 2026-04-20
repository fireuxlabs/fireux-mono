<template>
  <UPage>
    <UPageHeader
      title="Kitchen"
      description="Kitchen docs composed from the runtime spine."
      headline="Kitchen Canon"
    />

    <UPageBody class="space-y-6">
      <template v-for="chapter in chapters" :key="chapter.key">
        <section class="space-y-2">
          <p class="text-xs text-dimmed">Chapter {{ chapter.number }}</p>
          <h2 class="text-xl font-semibold">{{ chapter.title }}</h2>
          <ContentRenderer v-if="chapter.page" :value="chapter.page" />
          <p v-else class="text-sm text-dimmed">
            This chapter does not have a README yet.
          </p>
        </section>

        <USeparator v-if="chapter.number !== chapters.length" />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup>
definePageMeta({
  layout: 'docs',
  title: 'Kitchen',
})

const chapterDefinitions = [
  {
    key: 'kitchen',
    number: 1,
    title: 'Kitchen',
    path: '/src/runtime/pages/docs/kitchen/readme',
  },
  {
    key: 'concepts',
    number: 2,
    title: 'Concepts',
    path: '/src/runtime/concepts/stacks/kitchen/readme',
  },
  {
    key: 'assets',
    number: 3,
    title: 'Assets',
    path: '/src/runtime/assets/readme',
  },
  {
    key: 'components',
    number: 4,
    title: 'Components',
    path: '/src/runtime/components/readme',
  },
  {
    key: 'composables',
    number: 5,
    title: 'Composables',
    path: '/src/runtime/composables/readme',
  },
  {
    key: 'layouts',
    number: 6,
    title: 'Layouts',
    path: '/src/runtime/layouts/readme',
  },
  {
    key: 'middleware',
    number: 7,
    title: 'Middleware',
    path: '/src/runtime/middleware/readme',
  },
  {
    key: 'models',
    number: 8,
    title: 'Models',
    path: '/src/runtime/models/readme',
  },
  {
    key: 'pages',
    number: 9,
    title: 'Pages',
    path: '/src/runtime/pages/readme',
  },
  {
    key: 'plugins',
    number: 10,
    title: 'Plugins',
    path: '/src/runtime/plugins/readme',
  },
  {
    key: 'public',
    number: 11,
    title: 'Public',
    path: '/src/runtime/public/readme',
  },
  {
    key: 'server',
    number: 12,
    title: 'Server',
    path: '/src/runtime/server/readme',
  },
  {
    key: 'utils',
    number: 13,
    title: 'Utils',
    path: '/src/runtime/utils/readme',
  },
]

const { data: chaptersData } = await useAsyncData(
  'fireux-docs-kitchen-chapters',
  async () =>
    Promise.all(
      chapterDefinitions.map(async (chapter) => ({
        ...chapter,
        page: await queryCollection('fireuxDocs').path(chapter.path).first(),
      }))
    )
)

const chapters = computed(() => chaptersData.value || [])
</script>
