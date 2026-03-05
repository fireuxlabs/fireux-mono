<template>
  <div class="space-y-16 pb-20">
    <section
      class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40"
    >
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            About Misebox
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            {{ appSpec.tagline }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ appSpec.description }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            We run menus, recipes, dishes, prep tasks, team coordination, and hiring in one
            operating flow so service teams can move faster with less friction.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/kitchens" color="primary" size="lg">
              Open kitchens
            </UButton>
            <UButton to="/jobs" color="neutral" variant="ghost" size="lg">
              Publish roles
            </UButton>
          </div>
        </div>

        <div
          class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
        >
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em]">
            What this page covers
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>How the core Misebox modules fit together</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>The key entities and how they connect</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Small realistic sample objects for context</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>Quick links to public and console routes</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Misebox - Key Concepts (Priority Order)
            </h2>
            <ol class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">1. Ecosystem</span><br>
                An ecosystem of apps for kitchen operations and recruitment.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">2. Kitchen Operations</span><br>
                The systems kitchens use to organise menus, prep, service, and team.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">3. Kitchens</span><br>
                Each kitchen has its own workspace to run operations and organise its team.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">4. Professionals</span><br>
                Hospitality professionals create profiles that showcase experience instead of CVs.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">5. Jobs</span><br>
                Kitchens publish roles and connect directly with professionals.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">6. Menus &amp; Dishes</span><br>
                Menus, dishes, and recipes live in one structured system.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">7. Prep &amp; Service</span><br>
                Prep tasks and service coordination keep the kitchen organised.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">8. Team</span><br>
                Kitchens organise and manage the people running service.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">9. Suppliers</span><br>
                Suppliers connect kitchens with the ingredients and products they need.
              </li>
              <li>
                <span class="font-semibold text-gray-900 dark:text-white">10. Apps</span><br>
                Specialised apps extend the Misebox ecosystem over time.
              </li>
            </ol>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Modules
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            How we organize the app
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Each module owns a clear part of operations, and together they power one kitchen workflow.
          </p>
        </div>

        <UCard>
          <UAccordion type="multiple" class="space-y-2">
            <UAccordionItem
              v-for="(module, index) in appSpec.modules"
              :key="module.name"
              :value="`module-${index}`"
              :title="module.name"
            >
              <template #body>
                <div class="space-y-3 text-sm">
                  <p class="text-gray-600 dark:text-gray-300">{{ module.summary }}</p>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="entityName in module.entities"
                      :key="`${module.name}-${entityName}`"
                      color="neutral"
                      variant="soft"
                    >
                      {{ entityName }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UAccordionItem>
          </UAccordion>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Entities
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            The records we work with every day
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="entity in appSpec.entities"
            :key="entity.name"
            class="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ entity.name }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ entity.purpose }}
            </p>
            <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-white">Key fields:</span>
              {{ entity.keyFields.join(', ') }}
            </p>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-white">Links to:</span>
              {{ entity.linksTo.join(', ') }}
            </p>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="bg-gray-50/80 py-16 dark:bg-gray-900/40">
      <UContainer class="space-y-8">
        <div class="space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Structure
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            Relationship map
          </h2>
        </div>

        <UCard>
          <pre class="overflow-x-auto rounded bg-default p-4 text-xs leading-6">{{ relationshipMap }}</pre>
        </UCard>

        <div class="space-y-2 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Examples
          </p>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            Sample objects
          </h2>
        </div>

        <UCard>
          <UAccordion type="multiple" class="space-y-2">
            <UAccordionItem
              v-for="(sample, index) in appSpec.samples"
              :key="`${sample.entity}-${index}`"
              :value="`sample-${index}`"
              :title="sample.entity"
            >
              <template #body>
                <pre class="overflow-x-auto rounded bg-default p-4 text-xs leading-6">{{ jsonOf(sample.example) }}</pre>
              </template>
            </UAccordionItem>
          </UAccordion>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Key routes</h3>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="route in appSpec.routes"
              :key="route.path"
              :to="route.path"
              :icon="route.kind === 'console' ? 'i-lucide-terminal' : 'i-lucide-link'"
              :color="route.kind === 'console' ? 'primary' : 'neutral'"
              variant="soft"
            >
              {{ route.label }} · {{ route.path }}
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
type AppSpec = {
  name: string
  tagline: string
  description: string
  modules: Array<{ name: string; summary: string; entities: string[] }>
  entities: Array<{
    name: string
    purpose: string
    keyFields: string[]
    linksTo: string[]
  }>
  samples: Array<{ entity: string; example: Record<string, any> }>
  routes: Array<{ label: string; path: string; kind: 'public' | 'console' }>
}

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'About Misebox',
  description:
    'We run kitchen operations and hiring from one platform with a consistent operating workflow.',
})

const appSpec: AppSpec = {
  name: 'Misebox',
  tagline: 'Operating System for Kitchen Teams',
  description:
    'We run kitchen operations and hiring from one platform, with one consistent flow from prep to service and staffing.',
  modules: [
    {
      name: 'fireux-kitchens',
      summary: 'Kitchen operations module for day-to-day execution.',
      entities: ['Kitchen', 'Menu', 'Dish', 'Ingredient', 'KitchenRecipe', 'KitchenMiseTask', 'KitchenTeamMember'],
    },
    {
      name: 'fireux-orders',
      summary: 'Order flow model for customer and service orders.',
      entities: ['Order'],
    },
    {
      name: 'fireux-jobs',
      summary: 'Hiring and profile module for talent matching.',
      entities: ['Job', 'Professional', 'Agent'],
    },
    {
      name: 'fireux-suppliers',
      summary: 'Supplier profile module for sourcing and catalog coordination.',
      entities: ['Supplier', 'Company'],
    },
    {
      name: 'fireux-places',
      summary: 'Location identity used across kitchens and companies.',
      entities: ['Place'],
    },
    {
      name: 'Chef profile',
      summary: 'Kitchen-side professional profile used in Misebox operations.',
      entities: ['Chef'],
    },
  ],
  entities: [
    {
      name: 'Place',
      purpose: 'Canonical location identity used by multiple domain records.',
      keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
      linksTo: ['Kitchen', 'Company'],
    },
    {
      name: 'Kitchen',
      purpose: 'Operational kitchen identity and runtime context.',
      keyFields: ['id', 'name', 'short_address', 'image_url', 'is_test_kitchen'],
      linksTo: ['Menu', 'Dish', 'Ingredient', 'KitchenRecipe', 'KitchenMiseTask', 'KitchenTeamMember', 'Order', 'Job'],
    },
    {
      name: 'Menu',
      purpose: 'Service-ready menu with sections and sellable items.',
      keyFields: ['id', 'kitchen_id', 'name', 'sections', 'active'],
      linksTo: ['Dish'],
    },
    {
      name: 'Dish',
      purpose: 'Individual food item with recipe and ingredient links.',
      keyFields: ['id', 'kitchen_id', 'name', 'ingredient_ids', 'recipe_ids'],
      linksTo: ['Ingredient', 'KitchenRecipe'],
    },
    {
      name: 'Ingredient',
      purpose: 'Stock and costing ingredient identity for dishes and purchasing.',
      keyFields: ['id', 'name', 'default_unit', 'allergens', 'active'],
      linksTo: ['Dish', 'KitchenRecipe', 'Supplier'],
    },
    {
      name: 'KitchenRecipe',
      purpose: 'Standardized prep/cook instructions for consistent output.',
      keyFields: ['id', 'name', 'yield_qty', 'ingredient_lines', 'steps'],
      linksTo: ['Dish', 'Ingredient'],
    },
    {
      name: 'KitchenMiseTask',
      purpose: 'Prep and service task tracking for kitchen operations.',
      keyFields: ['id', 'kitchen_id', 'title', 'station', 'status'],
      linksTo: ['KitchenTeamMember', 'Menu', 'KitchenRecipe'],
    },
    {
      name: 'KitchenTeamMember',
      purpose: 'Team assignment record for stations, roles, and capability tags.',
      keyFields: ['id', 'kitchen_id', 'name', 'role', 'station'],
      linksTo: ['KitchenMiseTask'],
    },
    {
      name: 'Order',
      purpose: 'Customer/service order with scope, lines, totals, and status.',
      keyFields: ['id', 'scope_type', 'scope_id', 'status', 'totals'],
      linksTo: ['Kitchen', 'Menu'],
    },
    {
      name: 'Job',
      purpose: 'Open role advertised to professionals in the ecosystem.',
      keyFields: ['id', 'title', 'status', 'type', 'place_id'],
      linksTo: ['Kitchen', 'Professional', 'Agent'],
    },
    {
      name: 'Chef',
      purpose: 'Chef profile overlay used in Misebox workflow.',
      keyFields: ['id', 'title', 'summary', 'positions', 'user.id'],
      linksTo: ['User', 'Kitchen', 'Job'],
    },
    {
      name: 'Professional',
      purpose: 'Cross-role profile with experience and contact surfaces.',
      keyFields: ['id', 'title', 'summary', 'positions', 'user.id'],
      linksTo: ['Job', 'Agent'],
    },
    {
      name: 'Agent',
      purpose: 'Recruiting/operator profile for staffing and outreach.',
      keyFields: ['id', 'title', 'summary', 'user.id', 'coverage'],
      linksTo: ['Professional', 'Job'],
    },
    {
      name: 'Supplier',
      purpose: 'Supplier profile and sourcing identity for kitchens.',
      keyFields: ['id', 'name', 'email', 'phone', 'place_id'],
      linksTo: ['Company', 'Ingredient', 'Kitchen'],
    },
    {
      name: 'Company',
      purpose: 'Business identity tied to places and supplier/client structures.',
      keyFields: ['id', 'name', 'place_id', 'short_name'],
      linksTo: ['Place', 'Supplier'],
    },
  ],
  samples: [
    {
      entity: 'Kitchen',
      example: {
        id: 'k_demo_grill_yard',
        name: 'Grill Yard Demo Kitchen',
        short_address: 'Market Street 12',
        is_test_kitchen: false,
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&q=80',
      },
    },
    {
      entity: 'Menu',
      example: {
        id: 'menu_lunch_core',
        kitchen_id: 'k_demo_grill_yard',
        name: 'Lunch Core',
        active: true,
        sections: [{ id: 'sec_main', label: 'Main', items: [{ dish_id: 'dish_smash_burger' }] }],
      },
    },
    {
      entity: 'Order',
      example: {
        id: 'ord_demo_1024',
        scope_type: 'kitchen',
        scope_id: 'k_demo_grill_yard',
        status: 'open',
        totals: { subtotal_minor: 2450, total_minor: 2646, currency_code: 'CHF' },
      },
    },
    {
      entity: 'Job',
      example: {
        id: 'job_demo_cdpline',
        title: 'Chef de Partie - Grill',
        status: 'open',
        type: 'fixed',
        place_id: 'place_demo_interlaken',
      },
    },
    {
      entity: 'Professional',
      example: {
        id: 'prof_demo_ivy_lane',
        title: 'Sous Chef',
        summary: 'Experienced in alpine hotel and event kitchens.',
        positions: ['Sous Chef', 'Chef de Partie'],
        user: { id: 'user_demo_ivy', display_name: 'Ivy Lane' },
      },
    },
  ],
  routes: [
    { label: 'Home', path: '/', kind: 'public' },
    { label: 'Get Started', path: '/get-started', kind: 'public' },
    { label: 'Kitchens', path: '/kitchens', kind: 'public' },
    { label: 'Jobs', path: '/jobs', kind: 'public' },
    { label: 'Professionals', path: '/professionals', kind: 'public' },
    { label: 'Console Entry', path: '/console', kind: 'console' },
    { label: 'Kitchen Console', path: '/console/kitchen', kind: 'console' },
  ],
}

const relationshipMap = `
Place
  -> Kitchen
       -> Menu -> Dish -> Ingredient
       -> KitchenRecipe
       -> KitchenMiseTask -> KitchenTeamMember
       -> Order
       -> Job -> Professional
                       -> Agent
Company
  -> Supplier
       -> Ingredient
`

const jsonOf = (value: Record<string, any>) => JSON.stringify(value, null, 2)
</script>
