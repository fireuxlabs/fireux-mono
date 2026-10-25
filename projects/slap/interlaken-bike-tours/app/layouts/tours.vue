<template>
  <div class="tour-site">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header wrap">
      <NuxtLink to="/" class="brand" aria-label="Interlaken Bike Tours home"
        >INTERLAKEN<span>BIKE TOURS</span></NuxtLink
      >
      <nav aria-label="Main navigation">
        <NuxtLink to="/#tours">The rides</NuxtLink>
        <NuxtLink to="/destinations">Destinations</NuxtLink>
        <NuxtLink to="/#guide">Your guide</NuxtLink>
        <NuxtLink to="/dashboard">Your account</NuxtLink>
        <UButton
          to="/#enquire"
          color="primary"
          trailing-icon="i-lucide-arrow-up-right"
          >Plan a ride</UButton
        >
      </nav>
    </header>
    <main id="main"><slot /></main>
    <footer class="site-footer wrap">
      <div>
        <NuxtLink to="/" class="brand"
          >INTERLAKEN<span>BIKE TOURS</span></NuxtLink
        >
        <p>Small roads. Big days.</p>
      </div>
      <div class="footer-contact">
        <a href="mailto:info@interlakenbiketours.com"
          >info@interlakenbiketours.com</a
        ><a href="tel:+41764659530">+41 76 465 95 30</a>
        <p>3800 Interlaken, Switzerland</p>
      </div>
      <p class="prototype-note">
        Design prototype · Enquiries open WhatsApp or your email app.
        Availability is confirmed by your guide.
      </p>
      <FireLayoutsSharedPlatformFooter class="platform-footer" />
    </footer>
  </div>
</template>
