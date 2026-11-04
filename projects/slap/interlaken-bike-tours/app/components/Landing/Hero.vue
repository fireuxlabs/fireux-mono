<template>
  <section class="hero">
    <div class="hero-media" aria-hidden="true">
      <img
        src="/images/lake.webp"
        alt=""
        fetchpriority="high"
        width="1600"
        height="1600"
      />
    </div>
    <div class="hero-shade" aria-hidden="true"></div>
    <div class="hero-copy wrap">
      <p class="eyebrow">Interlaken · Bernese Oberland</p>
      <h1>Command<br />the Alps.</h1>
      <p class="intro">
        Private guided bike and e-bike tours from Interlaken. Ride at your own
        pace through Lauterbrunnen, along Lake Brienz, or to Giessbach Falls.
      </p>
      <div class="hero-actions">
        <UButton
          class="booking-action"
          to="#enquire"
          size="xl"
          color="primary"
          trailing-icon="i-lucide-arrow-up-right"
          >Book a tour</UButton
        >
        <UButton
          class="secondary-action"
          to="#tours"
          size="xl"
          variant="outline"
          color="neutral"
          trailing-icon="i-lucide-arrow-down-right"
          >See the tours</UButton
        >
      </div>
    </div>
    <dl class="hero-facts wrap" aria-label="Tour highlights">
      <div>
        <dt>Languages</dt>
        <dd>English + German</dd>
      </div>
      <div>
        <dt>Groups</dt>
        <dd>Private, always</dd>
      </div>
      <div>
        <dt>Included</dt>
        <dd>Bike + helmet</dd>
      </div>
      <div>
        <dt>Booking</dt>
        <dd>Ask about today</dd>
      </div>
    </dl>
  </section>
</template>
