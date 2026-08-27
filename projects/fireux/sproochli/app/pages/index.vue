<template>
  <div class="sproochli-landing">
    <section class="sproochli-hero">
      <div class="sproochli-hero__copy">
        <UBadge color="primary" variant="soft">
          Source intent → reviewed public copy
        </UBadge>

        <h1>Say it clearly.<br><span>Keep it yours.</span></h1>

        <p>
          Draft multilingual visitor information with AI, review every word,
          then publish dependable copy for QR pages, menus, signs, and guides.
        </p>

        <div class="sproochli-hero__actions">
          <UButton
            to="/get-started"
            color="primary"
            size="xl"
            icon="i-lucide-scan-line"
          >
            See a translated page
          </UButton>
          <UButton
            to="/tools/menu"
            color="neutral"
            variant="soft"
            size="xl"
            icon="i-lucide-languages"
          >
            Explore the translation tool
          </UButton>
        </div>

        <ul class="sproochli-hero__trust" aria-label="Product principles">
          <li><UIcon name="i-lucide-file-input" /> Source preserved</li>
          <li><UIcon name="i-lucide-badge-check" /> Human approved</li>
          <li><UIcon name="i-lucide-shield-check" /> Trusted generation</li>
        </ul>
      </div>

      <div class="sproochli-hero__visual" aria-hidden="true">
        <img src="/img/app/cover.png" alt="">
        <div class="sproochli-language-card sproochli-language-card--source">
          <span>EN · source</span>
          <strong>Come and eat</strong>
        </div>
        <div class="sproochli-language-card sproochli-language-card--approved">
          <span>GSW · approved</span>
          <strong>Chum cho esse</strong>
          <UIcon name="i-lucide-badge-check" />
        </div>
      </div>
    </section>

    <section class="sproochli-loop" aria-labelledby="sproochli-loop-title">
      <div class="sproochli-section-heading">
        <span>One dependable loop</span>
        <h2 id="sproochli-loop-title">From meaning to approved language.</h2>
        <p>AI helps with the first draft. People remain responsible for the words that go public.</p>
      </div>

      <ol class="sproochli-loop__steps">
        <li>
          <span class="sproochli-step-number">01</span>
          <UIcon name="i-lucide-message-square-text" />
          <h3>Write the intent</h3>
          <p>Keep the original source, context, and purpose together.</p>
        </li>
        <li>
          <span class="sproochli-step-number">02</span>
          <UIcon name="i-lucide-sparkles" />
          <h3>Draft with context</h3>
          <p>Use language, locale, glossary, and style—not a generic word swap.</p>
        </li>
        <li>
          <span class="sproochli-step-number">03</span>
          <UIcon name="i-lucide-badge-check" />
          <h3>Review, then publish</h3>
          <p>Provenance and approval stay visible before important copy ships.</p>
        </li>
      </ol>
    </section>

    <section class="sproochli-proof" aria-labelledby="sproochli-proof-title">
      <div class="sproochli-proof__copy">
        <UBadge color="primary" variant="subtle">First dialect proof</UBadge>
        <h2 id="sproochli-proof-title">Swiss German is not just “German”.</h2>
        <p>
          Sproochli treats dialect as authored language. Interlaken Essen’s
          Berner Oberland profile carries its own locale, tone, and approved
          glossary instead of falling back to standard German.
        </p>
        <div class="sproochli-phrases" aria-label="Approved Interlaken phrases">
          <span>Choufe</span>
          <span>Verchoufe</span>
          <span>Futter</span>
          <span>Chum cho esse</span>
        </div>
      </div>

      <div class="sproochli-proof__record">
        <div>
          <span>Profile</span>
          <strong>Berner Oberland</strong>
        </div>
        <div>
          <span>Language</span>
          <strong>gsw-CH</strong>
        </div>
        <div>
          <span>Review state</span>
          <strong><UIcon name="i-lucide-circle-check" /> Approved</strong>
        </div>
        <div>
          <span>Public runtime</span>
          <strong>No live generation</strong>
        </div>
      </div>
    </section>

    <section class="sproochli-solutions">
      <div class="sproochli-section-heading">
        <span>Where it works</span>
        <h2>Useful language at the point of need.</h2>
      </div>
      <LandingSolutions variant="preview" />
    </section>

    <section class="sproochli-closing">
      <img src="/img/app/logo.png" alt="" aria-hidden="true">
      <div>
        <span>Small pages. Many languages.</span>
        <h2>Make the next thing people scan worth understanding.</h2>
      </div>
      <UButton
        to="/get-started"
        color="neutral"
        variant="solid"
        size="xl"
        trailing-icon="i-lucide-arrow-right"
      >
        View the live example
      </UButton>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Sproochli — reviewed multilingual copy',
  description: 'Draft with AI, review every word, and publish dependable multilingual copy for QR pages, menus, signs, and visitor information.',
})
</script>

<style scoped src="./sproochli-home.css"></style>
