<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Misebox Guide</UBadge>
        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">Learn More</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Misebox is the operating system for kitchens and professionals. This page maps the core routes and next actions.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/about" color="primary" icon="i-lucide-info">About</UButton>
          <UButton to="/pricing" color="neutral" variant="soft" icon="i-lucide-badge-dollar-sign">Pricing</UButton>
          <UButton to="/get-started" color="neutral" variant="ghost" icon="i-lucide-rocket">Get started</UButton>
          <UButton to="/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">Dev</UButton>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="space-y-6">
        <div class="max-w-3xl space-y-3">
          <UBadge color="primary" variant="soft">Business case</UBadge>
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white">
            Turn the menu into a working kitchen system.
          </h2>
          <p class="text-base leading-7 text-gray-600 dark:text-gray-300">
            Hospitality teams already run complex operations across paper, WhatsApp, spreadsheets,
            PDFs, supplier messages, staff memory, and half-used back-office tools. Misebox turns
            that operational mess into structured, reusable kitchen knowledge.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <UCard>
            <template #header>
              <h3 class="text-base font-semibold">Customer pain</h3>
            </template>
            <ul class="list-disc space-y-2 pl-5 text-sm text-muted">
              <li>Menus change faster than PDFs, staff notes, and translations can keep up.</li>
              <li>Recipes, prep lists, allergens, and supplier information live separately.</li>
              <li>Staff turnover turns kitchen knowledge into memory loss.</li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-base font-semibold">Misebox opportunity</h3>
            </template>
            <ul class="list-disc space-y-2 pl-5 text-sm text-muted">
              <li>Public menus connect to dishes, recipes, ingredients, allergens, and prep.</li>
              <li>Kitchen profiles and jobs connect operations with hospitality hiring.</li>
              <li>Supplier and ingredient records support sourcing and menu operations.</li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-base font-semibold">Best first wedge</h3>
            </template>
            <p class="text-sm leading-6 text-muted">
              Start with QR and public menus, then grow inward into structured dishes,
              allergens, recipes, prep, suppliers, teams, and hiring.
            </p>
          </UCard>
        </div>

        <UCard variant="subtle">
          <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div class="space-y-2">
              <h3 class="text-base font-semibold text-highlighted">Scope guardrail</h3>
              <p class="text-sm leading-6 text-muted">
                Every Misebox feature should attach to a real operational object: menu, dish,
                recipe, ingredient, prep task, supplier, team member, job, or public menu URL.
              </p>
            </div>
            <UButton to="/solutions" color="primary" variant="soft" icon="i-lucide-lightbulb">
              View solutions
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Core concepts</h2>
          </template>
          <ul class="list-disc space-y-2 pl-5 text-sm">
            <li>Kitchen operations: menus, dishes, recipes, prep, and service readiness.</li>
            <li>Team operations: staffing flow and handover inside the kitchen workspace.</li>
            <li>Recruitment flow: connect kitchens with professionals through one ecosystem.</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Primary surfaces</h2>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton to="/console/kitchen" color="primary" variant="soft" icon="i-lucide-terminal">Kitchen console</UButton>
            <UButton to="/pricing/apps" color="neutral" variant="soft" icon="i-lucide-app-window">App model</UButton>
            <UButton to="/pricing/partners" color="neutral" variant="soft" icon="i-lucide-handshake">Partners</UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · Misebox',
  description: 'Guide to Misebox concepts, pricing paths, and kitchen console surfaces.',
})
</script>
