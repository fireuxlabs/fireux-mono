<template>
  <section class="metalbau" aria-labelledby="metalbau-title">
    <div class="metalbau-hero">
      <p class="metalbau-kicker"><span aria-hidden="true" /> Michel AG Metallbau</p>
      <h1 id="metalbau-title">Metallbau, der Bestand hat.</h1>
      <p class="metalbau-intro">Wir beraten, planen, fertigen, liefern und montieren Metallbauaufträge im Berner Oberland.</p>
      <div class="metalbau-actions">
        <UButton to="tel:+41338230550" size="xl" color="neutral"><Icon name="i-lucide-phone" /> 033 823 05 50</UButton>
        <UButton to="mailto:info@michelmetallbau.ch" size="xl" color="neutral" variant="outline">Anfrage senden</UButton>
      </div>
    </div>
    <div class="metalbau-rail" aria-hidden="true"><div class="metalbau-square metalbau-square--large" /><div class="metalbau-square" /><div class="metalbau-rule" /><div class="metalbau-square metalbau-square--small" /></div>
    <div class="metalbau-grid">
      <article><p>01</p><h2>Stahlbau</h2><span>Tragende Lösungen und Konstruktionen für Bauvorhaben jeder Grösse.</span></article>
      <article><p>02</p><h2>Metallbau</h2><span>Individuell geplant, gefertigt und montiert von unserem Team.</span></article>
      <article><p>03</p><h2>Tore</h2><span>Beratung, Lieferung und Montage von Torlösungen für die Region.</span></article>
    </div>
    <section class="metalbau-contact" aria-labelledby="contact-title">
      <div><p class="metalbau-kicker"><span aria-hidden="true" /> Kontakt</p><h2 id="contact-title">Besprechen wir Ihr Vorhaben.</h2></div>
      <address><a href="https://maps.google.com/?q=Hauptstrasse+73,+3805+Goldswil" target="_blank" rel="noopener noreferrer">Hauptstrasse 73<br>CH-3805 Goldswil</a><a href="mailto:info@michelmetallbau.ch">info@michelmetallbau.ch</a></address>
      <div class="metalbau-hours"><p>Mo–Do <strong>07.00–12.00 · 13.00–17.00</strong></p><p>Fr <strong>07.00–12.00 · 13.00–15.00</strong></p></div>
    </section>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing', nav: { key: 'home', label: 'Start', icon: 'i-lucide-home', desktop: true, mobile: true, layouts: ['landing'] } })
useSeoMeta({ title: 'Michel AG Metallbau | Goldswil', description: 'Metall- und Stahlbau, Tore sowie Beratung, Planung und Montage in Goldswil im Berner Oberland.' })
</script>

<style scoped>
:global(.fx-layout-shell), :global(.fx-layout-main) { background: #f4f4ef; }.metalbau { padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 24)) 0; color: #111; }.metalbau-hero { max-width: 56rem; }.metalbau-kicker { display: flex; gap: calc(var(--spacing) * 2.6); align-items: center; font-size: var(--text-xs); font-weight: var(--font-weight-bold); letter-spacing: .13em; text-transform: uppercase; }.metalbau-kicker span, .metalbau-square { display: inline-block; background: #111; }.metalbau-kicker span { width: .7rem; height: .7rem; } h1, h2 { margin: 0; font-weight: var(--font-weight-extrabold); letter-spacing: -.055em; line-height: .94; } h1 { font-size: clamp(3.2rem, 9vw, 7.5rem); } h2 { font-size: clamp(1.8rem, 3vw, 2.8rem); }.metalbau-intro { max-width: 42rem; margin: calc(var(--spacing) * 8) 0; color: #454545; font-size: 1.2rem; line-height: 1.55; }.metalbau-actions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 3); }.metalbau-rail { display: flex; align-items: center; gap: clamp(calc(var(--spacing) * 3), 3vw, calc(var(--spacing) * 8)); margin: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 28)) 0; }.metalbau-square--large { width: clamp(7rem, 18vw, 14rem); aspect-ratio: 1; }.metalbau-square:not(.metalbau-square--large):not(.metalbau-square--small) { width: clamp(2.5rem, 7vw, 5rem); aspect-ratio: 1; }.metalbau-square--small { width: 1rem; aspect-ratio: 1; }.metalbau-rule { flex: 1; height: 1px; background: #111; }.metalbau-grid { display: grid; grid-template-columns: repeat(3, 1fr); border-block: 1px solid #111; }.metalbau-grid article { min-height: 15rem; padding: calc(var(--spacing) * 6); border-right: 1px solid #111; }.metalbau-grid article:last-child { border: 0; }.metalbau-grid p { margin: 0 0 calc(var(--spacing) * 14); font-size: var(--text-xs); font-weight: var(--font-weight-bold); }.metalbau-grid span { display: block; margin-top: calc(var(--spacing) * 4); color: #555; line-height: var(--leading-normal); }.metalbau-contact { display: grid; grid-template-columns: 1.4fr 1fr 1.25fr; gap: calc(var(--spacing) * 8); padding: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 28)) 0 calc(var(--spacing) * 4); }.metalbau-contact address { display: grid; gap: calc(var(--spacing) * 4); font-style: normal; line-height: var(--leading-normal); }.metalbau-contact a { color: inherit; text-decoration: none; }.metalbau-hours p { display: flex; justify-content: space-between; gap: calc(var(--spacing) * 4); margin: 0; padding: calc(var(--spacing) * 3) 0; border-bottom: 1px solid #d4d4d4; } @media (max-width: 700px) { .metalbau-grid, .metalbau-contact { grid-template-columns: 1fr; }.metalbau-grid article { min-height: 0; border-right: 0; border-bottom: 1px solid #111; }.metalbau-grid article:last-child { border: 0; }.metalbau-contact { gap: calc(var(--spacing) * 10); }.metalbau-hours p { flex-direction: column; gap: calc(var(--spacing) * 1.2); } }
</style>
