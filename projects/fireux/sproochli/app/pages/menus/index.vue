<template>
  <UPage>
    <UContainer>
      <section class="pagebody" aria-labelledby="menus-title">
        <ULink to="/">
          <Icon name="i-lucide-arrow-left" />
          Sproochli
        </ULink>

        <div class="pagebody">
          <p class="fx-type-caption">Menus</p>
          <h1 id="menus-title" class="fx-type-page-title">Read-only menus</h1>
          <p class="fx-type-body">
            Translated menu pages for places that need a readable QR menu, not a
            full ordering system.
          </p>
        </div>

        <UCard>
          <div class="pagebody">
            <Icon name="i-lucide-utensils" />
            <p>Read-only menu translations will appear here.</p>
          </div>
        </UCard>
      </section>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Menus · Sproochli',
  description: 'Read-only translated menu pages in Sproochli.',
})
</script>
