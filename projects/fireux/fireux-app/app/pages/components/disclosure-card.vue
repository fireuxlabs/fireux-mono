<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <FrameworkComponentDocsNav />
        </UPageAside>
      </template>

      <UBreadcrumb
        :items="[
          { label: 'Components', to: '/components' },
          { label: 'Disclosure Card' },
        ]"
      />
      <UPageHeader
        title="Disclosure Card"
        description="A card cell that reveals its content with Nuxt UI's accessible disclosure behavior."
      >
        <template #links>
          <UButton
            to="https://ui.nuxt.com/docs/components/collapsible"
            target="_blank"
            label="Nuxt UI reference"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageHeader>

      <UPageBody>
        <UPageSection
          id="example"
          title="Example"
          description="The cell surface stays clear while its content opens beneath the trigger."
        >
          <FireDisclosureCard
            v-model:open="previewOpen"
            title="Browser storage"
            description="Appearance and features requested in this App."
            icon="i-lucide-cookie"
          >
            <p class="fx-type-body">
              Appearance is remembered automatically. Other feature storage
              starts when you request sign-in, offline support, a cart, or chat.
            </p>
            <UButton
              to="/legal#browser-storage"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
            >
              Read the browser storage details
            </UButton>
          </FireDisclosureCard>
        </UPageSection>

        <UPageSection
          id="usage"
          title="Usage"
          description="Use v-model:open when the parent coordinates several cards."
        >
          <UCard variant="subtle">
            <pre><code>{{ usageExample }}</code></pre>
          </UCard>
          <p class="fx-type-body">
            Without a model, the card manages its own open state. Its consumer
            owns the expanded content and can limit a group to one open card.
          </p>
        </UPageSection>

        <UPageSection
          id="api"
          title="API"
          description="The component owns only the cell and disclosure interaction."
        >
          <UTable :data="apiRows" :columns="apiColumns" />
        </UPageSection>
      </UPageBody>

      <template #right>
        <UPageAnchors :links="sections" />
      </template>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const previewOpen = ref(true)

const sections = [
  { label: 'Example', to: '#example' },
  { label: 'Usage', to: '#usage' },
  { label: 'API', to: '#api' },
]

const usageExample = `<FireDisclosureCard
  v-model:open="storageOpen"
  title="Browser storage"
  description="Appearance and requested features."
  icon="i-lucide-cookie"
>
  <p>Details shown while this card is open.</p>
</FireDisclosureCard>`

const apiColumns = [
  { accessorKey: 'name', header: 'Input' },
  { accessorKey: 'purpose', header: 'Purpose' },
]

const apiRows = [
  { name: 'title', purpose: 'Required trigger title.' },
  { name: 'description', purpose: 'Optional supporting text.' },
  { name: 'icon', purpose: 'Optional leading Nuxt UI icon.' },
  {
    name: 'v-model:open',
    purpose: 'Optional boolean model; defaults to closed.',
  },
  {
    name: 'update:open',
    purpose: 'Emitted when the user opens or closes the disclosure.',
  },
  { name: 'default slot', purpose: 'Content shown while the card is open.' },
]

definePageMeta({ layout: 'framework', requiresAuth: false })
useSeoMeta({
  title: 'Disclosure Card · FireUX components',
  description:
    'Use the shared FireUX Disclosure Card to reveal content inside the established cell surface.',
})
</script>
