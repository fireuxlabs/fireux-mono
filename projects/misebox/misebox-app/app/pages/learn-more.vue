<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section>
      <UContainer>
        <UBadge color="primary" variant="soft">Misebox Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More</h1>
        <p class="fx-type-description">
          Misebox is the operating system for kitchens and professionals. This
          page maps the core routes and next actions.
        </p>
        <div class="fx-card__actions">
          <UButton to="/about" color="primary" icon="i-lucide-info"
            >About</UButton
          >
          <UButton
            to="/pricing"
            color="neutral"
            variant="soft"
            icon="i-lucide-badge-dollar-sign"
            >Pricing</UButton
          >
          <UButton
            to="/get-started"
            color="neutral"
            variant="ghost"
            icon="i-lucide-rocket"
            >Get started</UButton
          >
          <UButton
            to="/learn-more/dev"
            color="neutral"
            variant="soft"
            icon="i-lucide-code-2"
            >Dev</UButton
          >
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="pagebody">
          <UBadge color="primary" variant="soft">Business case</UBadge>
          <h2 class="fx-type-section-title">
            Turn the menu into a working kitchen system.
          </h2>
          <p class="fx-type-body">
            Hospitality teams already run complex operations across paper,
            WhatsApp, spreadsheets, PDFs, supplier messages, staff memory, and
            half-used back-office tools. Misebox turns that operational mess
            into structured, reusable kitchen knowledge.
          </p>
        </div>

        <UPageGrid>
          <UCard>
            <template #header>
              <h3 class="fx-type-card-heading">Customer pain</h3>
            </template>
            <ul class="fx-list-stack">
              <li>
                Menus change faster than PDFs, staff notes, and translations can
                keep up.
              </li>
              <li>
                Recipes, prep lists, allergens, and supplier information live
                separately.
              </li>
              <li>Staff turnover turns kitchen knowledge into memory loss.</li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="fx-type-card-heading">Misebox opportunity</h3>
            </template>
            <ul class="fx-list-stack">
              <li>
                Public menus connect to dishes, recipes, ingredients, allergens,
                and prep.
              </li>
              <li>
                Kitchen profiles and jobs connect operations with hospitality
                hiring.
              </li>
              <li>
                Supplier and ingredient records support sourcing and menu
                operations.
              </li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="fx-type-card-heading">Best first wedge</h3>
            </template>
            <p class="fx-type-caption">
              Start with QR and public menus, then grow inward into structured
              dishes, allergens, recipes, prep, suppliers, teams, and hiring.
            </p>
          </UCard>
        </UPageGrid>

        <UCard variant="subtle">
          <div class="pagebody">
            <div class="fx-card-body-stack">
              <h3 class="fx-type-card-heading">Scope guardrail</h3>
              <p class="fx-type-caption">
                Every Misebox feature should attach to a real operational
                object: menu, dish, recipe, ingredient, prep task, supplier,
                team member, job, or public menu URL.
              </p>
            </div>
            <UButton
              to="/solutions"
              color="primary"
              variant="soft"
              icon="i-lucide-lightbulb"
            >
              View solutions
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Core concepts</h2>
          </template>
          <ul class="fx-list-stack">
            <li>
              Kitchen operations: menus, dishes, recipes, prep, and service
              readiness.
            </li>
            <li>
              Team operations: staffing flow and handover inside the kitchen
              workspace.
            </li>
            <li>
              Recruitment flow: connect kitchens with professionals through one
              ecosystem.
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary surfaces</h2>
          </template>
          <div class="fx-card__actions">
            <UButton
              to="/"
              color="primary"
              variant="soft"
              icon="i-lucide-terminal"
              >Kitchen workspace</UButton
            >
            <UButton
              to="/product"
              color="neutral"
              variant="soft"
              icon="i-lucide-app-window"
              >Product</UButton
            >
            <UButton
              to="/pricing"
              color="neutral"
              variant="soft"
              icon="i-lucide-badge-dollar-sign"
              >Pricing</UButton
            >
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
  description:
    'Guide to Misebox concepts, pricing paths, and kitchen workspace surfaces.',
})
</script>
