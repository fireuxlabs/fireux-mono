<template>
  <section class="landing-index-section">
    <div class="pagebody">
      <div class="pagebody">
        <h2 class="fx-type-section-title">Get started in minutes.</h2>
        <p class="fx-type-body">
          Create or select a portfolio, then run the workspace. Granite keeps
          the branch view clear and auditable - no hidden state, no magic
          defaults.
        </p>
      </div>

      <UPageGrid>
        <UCard>
          <div class="fx-card-body-stack">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-building-2" />
              <p class="fx-type-body">1) Choose a portfolio</p>
            </div>
            <p class="fx-type-caption">
              Each portfolio represents one client with many properties.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="fx-card-body-stack">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" />
              <p class="fx-type-body">2) Review risk</p>
            </div>
            <p class="fx-type-caption">
              Track obligations, evidence, expiries, and exposure.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="fx-card-body-stack">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-terminal" />
              <p class="fx-type-body">3) Run the workspace</p>
            </div>
            <p class="fx-type-caption">
              Keep incidents, tasks, and finance signals under control.
            </p>
          </div>
        </UCard>
      </UPageGrid>

      <div class="flex flex-wrap gap-3">
        <UButton
          to="/workspace/portfolio"
          color="primary"
          icon="i-lucide-building"
        >
          Select portfolio
        </UButton>
        <UButton
          to="/workspace/portfolio"
          variant="outline"
          icon="i-lucide-terminal"
        >
          Enter via selector
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
