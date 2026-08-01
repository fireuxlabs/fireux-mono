<template>
  <div class="yv-site">
    <header class="yv-header">
      <NuxtLink to="/" class="yv-brand" aria-label="Yellow Velo home">
        <img src="/img/app/wordmark-dark.svg" alt="Yellow Velo">
      </NuxtLink>

      <nav aria-label="Primary navigation">
        <NuxtLink to="/products">Shop</NuxtLink>
        <NuxtLink to="/products?category=Bicycles">Bicycles</NuxtLink>
        <NuxtLink to="/products?category=Apparel">Apparel</NuxtLink>
        <NuxtLink to="/blog">Journal</NuxtLink>
      </nav>

      <a
        href="https://www.instagram.com/yellow.velo.interlaken/"
        target="_blank"
        rel="noreferrer"
        class="yv-instagram"
      >
        @yellow.velo
        <UIcon name="i-lucide-arrow-up-right" />
      </a>
    </header>

    <NuxtPage />

    <footer class="yv-footer">
      <div class="yv-footer__lead">
        <p>Ride by. Stay awhile.</p>
        <h2>Yellow Velo<br>Interlaken</h2>
      </div>

      <div class="yv-footer__details">
        <div>
          <span>Find us</span>
          <p>3800 Interlaken<br>Bernese Oberland, Switzerland</p>
        </div>
        <div>
          <span>Explore</span>
          <NuxtLink to="/products">The shop</NuxtLink>
          <NuxtLink to="/blog">The journal</NuxtLink>
          <a href="https://www.instagram.com/yellow.velo.interlaken/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
        <p class="yv-footer__signoff">
          Bikes, parts and good things<br>for life on two wheels.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'yellow-velo-landing' })
</script>

<style>
.yv-site {
  min-height: 100svh;
  background: #f2f0e8;
  color: #11110f;
  font-family: var(--font-sans);
}

.yv-header {
  position: relative;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) auto minmax(10rem, 1fr);
  align-items: center;
  min-height: 5.75rem;
  padding: calc(var(--spacing) * 4) clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 18));
  border-bottom: 1px solid rgb(17 17 15 / .18);
  background: #f2f0e8;
}

.yv-brand {
  display: inline-flex;
  width: fit-content;
}

.yv-brand img {
  width: clamp(9rem, 13vw, 12.5rem);
  height: auto;
}

.yv-header nav {
  display: flex;
  align-items: center;
  gap: clamp(calc(var(--spacing) * 4.4), 2.8vw, calc(var(--spacing) * 10.8));
}

.yv-header nav a,
.yv-instagram {
  color: #11110f;
  font-size: .72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .12em;
  text-decoration: none;
  text-transform: uppercase;
}

.yv-header nav a:hover,
.yv-header nav a.router-link-active {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: .4rem;
}

.yv-instagram {
  display: inline-flex;
  justify-self: end;
  align-items: center;
  gap: calc(var(--spacing) * 1.4);
}

.yv-footer {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 36));
  padding: clamp(calc(var(--spacing) * 16), 9vw, calc(var(--spacing) * 32)) clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 20));
  background: #11110f;
  color: #f2f0e8;
}

.yv-footer__lead > p,
.yv-footer__details span {
  margin: 0 0 calc(var(--spacing) * 5);
  color: #e7d90b;
  font-size: .7rem;
  font-weight: var(--font-weight-black);
  letter-spacing: .16em;
  text-transform: uppercase;
}

.yv-footer h2 {
  margin: 0;
  font-size: clamp(var(--text-5xl), 7vw, 7.5rem);
  font-weight: var(--font-weight-black);
  letter-spacing: -.07em;
  line-height: .84;
  text-transform: uppercase;
}

.yv-footer__details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-content: end;
  gap: calc(var(--spacing) * 12);
}

.yv-footer__details p,
.yv-footer__details a {
  display: block;
  margin: 0 0 calc(var(--spacing) * 2.2);
  color: inherit;
  font-size: .9rem;
  font-weight: 650;
  line-height: 1.65;
  text-decoration: none;
}

.yv-footer__details a:hover {
  color: #e7d90b;
}

.yv-footer__signoff {
  grid-column: 1 / -1;
  padding-top: calc(var(--spacing) * 8);
  border-top: 1px solid rgb(242 240 232 / .25);
}

@media (max-width: 760px) {
  .yv-header {
    grid-template-columns: 1fr auto;
    min-height: 4.5rem;
  }

  .yv-header nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: space-between;
    gap: calc(var(--spacing) * 2.8);
    padding-top: calc(var(--spacing) * 3.6);
    overflow-x: auto;
  }

  .yv-header nav a {
    font-size: .62rem;
  }

  .yv-instagram {
    font-size: 0;
  }

  .yv-instagram svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  .yv-footer {
    grid-template-columns: 1fr;
  }

  .yv-footer__details {
    grid-template-columns: 1fr;
  }
}
</style>
