<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar :title="pageTitle" :show-title="false">
          <template #right>
            <MiseboxWorkspaceKitchenContextInfo />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <section
            class="grid gap-8 py-4 sm:py-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] xl:items-center"
          >
            <header class="grid max-w-3xl gap-5">
              <h1
                class="m-0 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl"
              >
                Restaurant menu and Kitchen management workspace
              </h1>
              <p class="m-0 min-h-12 text-base leading-7 text-muted sm:text-lg">
                {{ subscriptionIntroduction }}
              </p>

              <UButton
                to="/tools"
                label="Browse restaurant tools"
                color="neutral"
                variant="link"
                class="w-fit px-0"
                trailing-icon="i-lucide-arrow-right"
              />
            </header>

            <main class="min-w-0" aria-label="KitchenAI">
              <WorkspaceKitchenAI
                title="What would you like to work on?"
                agent-label=""
                :starters="[]"
                class="kitchen-ai-welcome--landing"
              />
            </main>
          </section>

          <div id="kitchen-workspace" class="scroll-mt-4">
            <WorkspaceKitchenCollection />
          </div>

          <section
            aria-labelledby="workspace-capabilities"
            class="grid gap-5 border-t border-default pt-6"
          >
            <div
              class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3"
            >
              <div class="grid max-w-2xl gap-1">
                <h2
                  id="workspace-capabilities"
                  class="m-0 text-2xl font-semibold text-highlighted"
                >
                  What you can do
                </h2>
                <p class="m-0 text-sm leading-6 text-muted">
                  Work with Menus, preparation, service and the records behind
                  them.
                </p>
              </div>
              <UButton
                to="/operations"
                label="All Kitchen operations"
                color="neutral"
                variant="link"
                trailing-icon="i-lucide-arrow-right"
              />
            </div>

            <div class="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
              <NuxtLink
                v-for="operation in operations"
                :key="operation.to"
                :to="operation.to"
                class="group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-default py-4"
              >
                <UIcon
                  :name="operation.icon"
                  class="mt-0.5 size-5 text-primary"
                />
                <span class="min-w-0">
                  <strong class="block text-sm font-semibold text-highlighted">
                    {{ operation.label }}
                  </strong>
                  <span class="mt-1 block text-sm leading-5 text-muted">
                    {{ operation.description }}
                  </span>
                </span>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="mt-0.5 size-4 text-dimmed transition group-hover:text-primary"
                />
              </NuxtLink>
            </div>
          </section>

          <section aria-labelledby="free-tools" class="grid gap-4">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div class="grid max-w-2xl gap-1">
                <h2
                  id="free-tools"
                  class="m-0 text-2xl font-semibold text-highlighted"
                >
                  Free restaurant tools
                </h2>
                <p class="m-0 text-sm leading-6 text-muted">
                  Calculators, QR Menus and restaurant ordering.
                </p>
              </div>
              <UButton
                to="/tools"
                label="All restaurant tools"
                color="neutral"
                variant="link"
                trailing-icon="i-lucide-arrow-right"
              />
            </div>

            <div class="grid gap-3 md:grid-cols-2">
              <UPageCard
                v-for="tool in freeTools"
                :key="tool.to"
                :to="tool.to"
                :title="tool.label"
                :description="tool.description"
                :icon="tool.icon"
                variant="subtle"
              />
            </div>
          </section>

          <div class="grid gap-4 lg:grid-cols-2">
            <UPageCard
              id="kitchen-directory"
              title="Discover Kitchens"
              description="Browse published Kitchens, restaurant profiles, current Menus and available ordering options."
              icon="i-lucide-map"
              to="/kitchens"
              variant="subtle"
            />
            <UPageCard
              id="workspace-access"
              title="Choose your Kitchen capacity"
              description="Free supports one Kitchen and one published Menu. Premium adds multiple Menus. Business supports multiple Kitchens. Sign in to keep an anonymous Kitchen with your account."
              icon="i-lucide-badge-check"
              to="/pricing"
              variant="subtle"
            />
          </div>

          <nav
            aria-label="Explore Misebox"
            class="flex flex-wrap gap-x-5 gap-y-2 border-t border-default pt-5 text-sm"
          >
            <NuxtLink
              v-for="link in discoveryLinks"
              :key="link.to"
              :to="link.to"
              class="font-medium text-muted hover:text-highlighted"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { appMeta } from '../meta'

const kitchenWorkspace = useWorkspace('kitchen')
const { appAccess, appAccessOutcome } = useUser()
const pageTitle = computed(
  () => kitchenWorkspace.activeName.value || 'Kitchen Workspace'
)
const visibleSubscription = computed(() =>
  appAccessOutcome.value === 'ready' ? appAccess.value.subscription : 'free'
)
const subscriptionIntroduction = computed(() => {
  if (visibleSubscription.value === 'business') {
    return 'Manage multiple Kitchens, Menus and teams.'
  }
  if (visibleSubscription.value === 'premium') {
    return 'Manage your Kitchen and publish multiple Menus.'
  }
  return 'Start one Kitchen and publish one restaurant Menu for free. No sign-up required.'
})

const operations = [
  {
    label: 'Restaurant Menus',
    description: 'Create, structure and publish restaurant Menus.',
    to: '/operations/menus',
    icon: 'i-lucide-book-open',
  },
  {
    label: 'Dishes',
    description: 'Manage the Dishes used across Menus and Recipes.',
    to: '/operations/dishes',
    icon: 'i-lucide-utensils',
  },
  {
    label: 'Recipes',
    description: 'Maintain Recipe ingredients, methods and yields.',
    to: '/operations/recipes',
    icon: 'i-lucide-notebook-tabs',
  },
  {
    label: 'Kitchen prep',
    description: 'Plan and track preparation work before service.',
    to: '/operations/mise',
    icon: 'i-lucide-list-checks',
  },
  {
    label: 'Restaurant orders',
    description: 'Run the Kitchen order board and service queue.',
    to: '/operations/orders',
    icon: 'i-lucide-receipt-text',
  },
  {
    label: 'Kitchen sales',
    description: 'Review bounded sales measures by period.',
    to: '/operations/finance',
    icon: 'i-lucide-chart-column',
  },
  {
    label: 'Suppliers',
    description: 'Connect Suppliers, catalogues and supply options.',
    to: '/operations/suppliers',
    icon: 'i-lucide-truck',
  },
  {
    label: 'Ingredients',
    description: 'Maintain the Ingredients used by the Kitchen.',
    to: '/operations/ingredients',
    icon: 'i-lucide-carrot',
  },
] as const

const freeTools = [
  {
    label: 'Restaurant labour-cost calculator',
    description:
      'Calculate labour cost and labour percentage from restaurant sales and staffing costs.',
    to: '/tools/restaurant-labour-cost',
    icon: 'i-lucide-calculator',
  },
  {
    label: 'QR Menu',
    description:
      'Publish a restaurant Menu that guests can open from a QR code.',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-qr-code',
  },
  {
    label: 'Menu URL QR',
    description: 'Create a QR code that opens an existing restaurant Menu URL.',
    to: '/solutions/qr-menu-url',
    icon: 'i-lucide-link',
  },
  {
    label: 'Restaurant ordering',
    description:
      'Open the Misebox ordering tool with an available restaurant Menu.',
    to: '/tools/ordering',
    icon: 'i-lucide-shopping-bag',
  },
] as const

const discoveryLinks = [
  { label: 'Solutions', to: '/solutions' },
  { label: 'Operations', to: '/operations' },
  { label: 'Tools', to: '/tools' },
  { label: 'Kitchens', to: '/kitchens' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  nav: {
    key: 'workspace-kitchen',
    label: 'Current Kitchen',
    description: 'My Kitchen',
    icon: 'i-lucide-chef-hat',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
