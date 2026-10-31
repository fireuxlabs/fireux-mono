<template>
  <UPageSection
    title="An app builder. An industry foundation."
    description="Lovable helps you build an app with AI. FireUX is designed to give your industry SaaS a shared operating model."
  >
    <UPageGrid>
      <UPageCard
        title="Lovable"
        description="Describe the app you want to build."
        icon="i-lucide-message-square"
      >
        <ul class="fx-list-stack">
          <li>Build and refine a custom application through conversation.</li>
          <li>Add backend data, accounts, integrations and payments.</li>
          <li>Shape the business workflows around your project.</li>
        </ul>
        <template #footer>
          <UButton
            to="https://lovable.dev/cloud"
            target="_blank"
            label="Lovable's offering"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageCard>
      <UPageCard
        title="FireUX"
        description="Start with how an industry works."
        icon="i-lucide-flame"
      >
        <ul class="fx-list-stack">
          <li>An operating Workspace as the starting point.</li>
          <li>
            Connected business capabilities, composed with your industry's
            rules.
          </li>
          <li>
            An industry platform and customer Apps built on shared foundations.
          </li>
        </ul>
        <template #footer>
          <UButton
            to="/capabilities"
            label="Explore the foundations"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
          />
        </template>
      </UPageCard>
    </UPageGrid>
    <p class="fx-type-caption">
      Lovable can build SaaS too. Our direction is to make the operating
      foundation reusable across industry products, with Ignition guiding their
      assembly.
    </p>
  </UPageSection>
</template>
