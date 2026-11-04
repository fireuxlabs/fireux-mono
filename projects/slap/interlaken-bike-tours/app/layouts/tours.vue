<template>
  <div class="tour-site">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="header-inner wrap">
        <NuxtLink to="/" class="brand" aria-label="Interlaken Bike Tours home"
          >INTERLAKEN<span>BIKE TOURS</span></NuxtLink
        >
        <nav aria-label="Main navigation">
          <NuxtLink to="/#tours">Tours</NuxtLink>
          <NuxtLink to="/#rental">Bike rental</NuxtLink>
          <NuxtLink to="/#contact">Contact</NuxtLink>
        </nav>
        <UButton
          class="header-book"
          to="/#enquire"
          color="primary"
          trailing-icon="i-lucide-arrow-up-right"
          >Book a tour</UButton
        >
      </div>
    </header>
    <main id="main"><slot /></main>
    <footer class="site-footer">
      <div class="footer-inner wrap">
        <div>
          <NuxtLink to="/" class="brand"
            >INTERLAKEN<span>BIKE TOURS</span></NuxtLink
          >
          <p class="footer-signoff">One guide. Your group. The whole valley.</p>
        </div>
        <div class="footer-contact">
          <NuxtLink to="/dashboard">Your account ↗</NuxtLink>
          <a href="mailto:info@interlakenbiketours.com"
            >info@interlakenbiketours.com</a
          >
          <a href="tel:+41764659530">+41 76 465 95 30</a>
          <p>3800 Interlaken, Switzerland</p>
        </div>
        <p class="prototype-note">
          Enquiries open WhatsApp or your email app. Your guide confirms
          availability and booking.
        </p>
        <FireLayoutsSharedPlatformFooter class="platform-footer" />
      </div>
    </footer>
  </div>
</template>
