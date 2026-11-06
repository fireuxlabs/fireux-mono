<template>
  <section class="landing-index-section">
    <div class="pagebody">
      <div class="pagebody">
        <h2 class="fx-type-section-title">Built for branch operations.</h2>
        <p class="fx-type-body">
          One workspace per branch. Manage many client portfolios with
          consistent structure and audit-ready records.
        </p>
      </div>

      <UCard>
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="fx-card-body-stack">
            <p class="fx-type-caption">Ready to run Granite?</p>
            <p class="fx-type-caption">
              Start with portfolios, then use the workspace as your control
              surface.
            </p>
          </div>

          <div class="fx-card__actions">
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
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
