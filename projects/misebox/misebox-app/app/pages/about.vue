<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep About focused on restaurant menu, prep, and service work. -->
<template>
  <div class="overflow-hidden pb-20">
    <section class="relative border-b border-default py-20 sm:py-28">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(171,182,132,0.22),transparent_42%)]"
      />
      <UContainer
        class="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"
      >
        <div class="max-w-3xl">
          <UBadge color="primary" variant="soft">About Misebox</UBadge>
          <h1
            class="fx-type-page-title mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            One connected workflow for menus, prep, and service.
          </h1>
          <p class="fx-type-description mt-7 max-w-2xl leading-8 sm:text-xl">
            Misebox turns menus, kitchen knowledge, daily preparation, and
            service orders into one connected workspace. It helps restaurant
            teams spend less time reconstructing information and more time
            running a great service.
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <UButton
              to="/get-started"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
            >
              Get started
            </UButton>
            <UButton
              to="/road-map"
              color="neutral"
              variant="soft"
              size="lg"
              icon="i-lucide-map"
            >
              See the road map
            </UButton>
          </div>
        </div>

        <div
          class="rounded-3xl border border-default bg-default/80 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-8"
        >
          <p class="fx-type-label text-primary">The idea</p>
          <p class="fx-type-card-title mt-4 text-2xl leading-tight">
            The menu should not be the end product. It should be the front door
            to how a kitchen works.
          </p>
          <div class="mt-7 grid grid-cols-2 gap-3">
            <div
              v-for="item in ideaItems"
              :key="item.label"
              class="rounded-2xl bg-muted/60 p-4"
            >
              <UIcon :name="item.icon" class="size-5 text-primary" />
              <p class="mt-3 text-sm font-medium text-highlighted">
                {{ item.label }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <div class="mx-auto max-w-3xl text-center">
          <p class="fx-type-headline">Why Misebox exists</p>
          <h2 class="fx-type-section-display mt-4">
            Kitchen knowledge is valuable. Too often, it is also fragmented.
          </h2>
          <p class="fx-type-description mt-5 leading-8">
            A service depends on hundreds of details, but those details are
            commonly split between paper, PDFs, spreadsheets, chat threads,
            supplier messages, and the memories of experienced people.
          </p>
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          <article
            v-for="problem in problems"
            :key="problem.title"
            class="rounded-3xl border border-default bg-default p-6"
          >
            <div
              class="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"
            >
              <UIcon :name="problem.icon" class="size-5" />
            </div>
            <h3 class="fx-type-card-heading mt-5">{{ problem.title }}</h3>
            <p class="fx-type-caption mt-2 leading-6">{{ problem.copy }}</p>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="border-y border-default bg-muted/30 py-20">
      <UContainer>
        <div class="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p class="fx-type-headline">One connected loop</p>
            <h2 class="fx-type-section-display mt-4">
              From what you serve to how you deliver it.
            </h2>
            <p class="mt-5 leading-7 text-muted">
              Misebox gives each operational object a proper place, then
              connects it to the next decision. The result is a system that
              becomes more useful as the team uses it.
            </p>
          </div>

          <ol class="grid gap-4 sm:grid-cols-2">
            <li
              v-for="(step, index) in operatingLoop"
              :key="step.title"
              class="rounded-3xl border border-default bg-default p-6"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-primary"
                  >0{{ index + 1 }}</span
                >
                <UIcon :name="step.icon" class="size-5 text-dimmed" />
              </div>
              <h3 class="fx-type-card-heading mt-8">{{ step.title }}</h3>
              <p class="fx-type-caption mt-2 leading-6">{{ step.copy }}</p>
            </li>
          </ol>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <div class="max-w-2xl">
          <p class="fx-type-headline">Built around real roles</p>
          <h2 class="fx-type-section-display mt-4">
            One system, different views of the same truth.
          </h2>
        </div>
        <div class="mt-10 grid gap-5 lg:grid-cols-3">
          <article
            v-for="audience in audiences"
            :key="audience.title"
            class="group rounded-3xl border border-default p-7 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <UIcon :name="audience.icon" class="size-7 text-primary" />
            <h3 class="fx-type-card-title mt-6 text-xl">
              {{ audience.title }}
            </h3>
            <p class="fx-type-caption mt-3 leading-6">{{ audience.copy }}</p>
            <UButton
              :to="audience.to"
              color="neutral"
              variant="link"
              class="mt-5 px-0"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ audience.action }}
            </UButton>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <div
          class="rounded-3xl bg-gray-950 px-6 py-12 text-white sm:px-10 lg:px-14 dark:bg-gray-900"
        >
          <div class="grid gap-12 lg:grid-cols-2">
            <div>
              <p class="fx-type-headline text-primary-300">How we build</p>
              <h2 class="fx-type-section-display mt-4 text-white">
                Useful on day one. Connected for what comes next.
              </h2>
              <p class="mt-5 leading-7 text-gray-300">
                Misebox starts with practical tools such as public menus and
                kitchen workspaces, then grows into deeper operational
                coordination without forcing teams into an all-or-nothing
                rollout.
              </p>
            </div>
            <ul class="space-y-5">
              <li
                v-for="principle in principles"
                :key="principle.title"
                class="flex gap-4"
              >
                <div
                  class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary-200"
                >
                  <UIcon name="i-lucide-check" class="size-4" />
                </div>
                <div>
                  <p class="font-semibold">{{ principle.title }}</p>
                  <p class="mt-1 text-sm leading-6 text-gray-400">
                    {{ principle.copy }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="pt-8">
      <UContainer class="text-center">
        <p class="fx-type-headline">The direction</p>
        <h2 class="fx-type-section-display mx-auto mt-4 max-w-3xl">
          Better kitchen systems create calmer services, stronger teams, and
          more resilient hospitality businesses.
        </h2>
        <p class="mx-auto mt-5 max-w-2xl leading-7 text-muted">
          That is what Misebox is about: making the knowledge behind hospitality
          easier to use, share, and improve.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton to="/kitchens" size="lg" icon="i-lucide-chef-hat"
            >Explore kitchens</UButton
          >
          <UButton to="/solutions" color="neutral" variant="soft" size="lg"
            >Explore solutions</UButton
          >
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const ideaItems = [
  { label: 'Menus and dishes', icon: 'i-lucide-notebook-tabs' },
  { label: 'Recipes and prep', icon: 'i-lucide-list-checks' },
  { label: 'Stations and teams', icon: 'i-lucide-users' },
  { label: 'Orders and handoff', icon: 'i-lucide-bell-ring' },
] as const

const problems = [
  {
    title: 'Information drifts',
    copy: 'The public menu, kitchen notes, allergen records, and team knowledge stop matching each other.',
    icon: 'i-lucide-files',
  },
  {
    title: 'Experience walks out',
    copy: 'When knowledge lives in memory, every absence and staff change creates avoidable operational risk.',
    icon: 'i-lucide-brain',
  },
  {
    title: 'Tools stay disconnected',
    copy: 'Point solutions add screens but rarely connect the menu, prep work, service queue, and people doing the work.',
    icon: 'i-lucide-unplug',
  },
] as const

const operatingLoop = [
  {
    title: 'Publish',
    copy: 'Turn kitchen-owned information into clear public menus and useful customer surfaces.',
    icon: 'i-lucide-qr-code',
  },
  {
    title: 'Structure',
    copy: 'Connect dishes to recipes, ingredients, allergens, prices, and supplier knowledge.',
    icon: 'i-lucide-network',
  },
  {
    title: 'Prepare',
    copy: 'Translate the menu into practical prep, station, and service work for the team.',
    icon: 'i-lucide-clipboard-check',
  },
  {
    title: 'Improve',
    copy: 'Keep the operational record current so the next menu and service start from better information.',
    icon: 'i-lucide-refresh-cw',
  },
] as const

const audiences = [
  {
    title: 'Owners and operators',
    copy: 'Create a dependable workspace for menus, recipes, team access, and daily Kitchen execution.',
    action: 'Explore kitchens',
    to: '/kitchens',
    icon: 'i-lucide-store',
  },
  {
    title: 'Service teams',
    copy: 'See guest choices enter a clear Kitchen queue and move toward a ready handoff.',
    action: 'Try the service demo',
    to: '/demo/service',
    icon: 'i-lucide-bell-ring',
  },
] as const

const principles = [
  {
    title: 'Start with real operational objects.',
    copy: 'Features attach to menus, dishes, recipes, ingredients, prep tasks, kitchens, people, or suppliers.',
  },
  {
    title: 'Keep ownership clear.',
    copy: 'Kitchens own their operational truth while public surfaces present the right part of it.',
  },
  {
    title: 'Make the simple path valuable.',
    copy: 'A team can begin with one useful surface and grow into the wider system at its own pace.',
  },
  {
    title: 'Keep focused products focused.',
    copy: 'Adjacent products such as Misebox Jobs can share trusted foundations without competing with the Kitchen workflow.',
  },
] as const

definePageMeta({
  layout: 'default',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeo({
  title: 'About Misebox · Restaurant menu and Kitchen workflow',
  description:
    'Misebox connects menus, dishes, recipes, prep work, service orders, and Kitchen handoff for restaurant teams.',
  path: '/about',
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
