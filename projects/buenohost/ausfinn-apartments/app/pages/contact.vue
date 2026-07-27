<template>
  <div>
    <AusfinnPageIntro
      eyebrow="A local welcome"
      title="Talk to Dane and the team."
      description="Questions, group trips, a favourite property or help choosing the right village—we are happy to help."
    />

    <section class="contact">
      <div>
        <p>Based in Interlaken</p>
        <h2>Friendly, experienced, and close by.</h2>
        <span>
          AUSFinn was founded to make the region feel open and easy to enjoy:
          comfortable homes, practical local help and a direct answer when you
          need one.
        </span>
      </div>
      <div class="contact__links">
        <a :href="`mailto:${ausfinnContent.email}`">
          <UIcon name="i-lucide-mail" />
          <span>
            <strong>Email AUSFinn</strong>
            {{ ausfinnContent.email }}
          </span>
          <UIcon name="i-lucide-arrow-up-right" />
        </a>
        <NuxtLink to="/book">
          <UIcon name="i-lucide-calendar-days" />
          <span>
            <strong>Ask about dates</strong>
            Prepare a complete stay enquiry.
          </span>
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
        <a
          href="https://www.facebook.com/AUSFinn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <UIcon name="i-lucide-facebook" />
          <span>
            <strong>Follow AUSFinn</strong>
            Photos and updates on Facebook.
          </span>
          <UIcon name="i-lucide-arrow-up-right" />
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ausfinnContent } from '../config/content.config'

definePageMeta({ layout: 'ausfinn-default' })

useSeoMeta({
  title: 'Contact | AUSFinn Apartments',
  description:
    'Contact the AUSFinn team directly about staying around Interlaken.',
})
</script>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: minmax(18rem, 0.9fr) minmax(20rem, 1.1fr);
  gap: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 32));
  padding: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 38))
    clamp(calc(var(--spacing) * 5), 7vw, calc(var(--spacing) * 24));
}

.contact > div:first-child {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: calc(var(--spacing) * 5);
}

.contact > div:first-child > p {
  margin: 0;
  color: var(--aus-coral);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.contact h2 {
  max-width: 12ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(var(--text-5xl), 6vw, var(--text-8xl));
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.06em;
  line-height: 0.94;
}

.contact > div:first-child > span {
  max-width: 36rem;
  color: var(--aus-muted);
  font-size: 1.1rem;
  line-height: 1.75;
}

.contact__links {
  display: grid;
  align-content: start;
}

.contact__links a {
  display: grid;
  grid-template-columns: calc(var(--spacing) * 8) 1fr calc(var(--spacing) * 6);
  gap: calc(var(--spacing) * 4);
  align-items: center;
  padding: calc(var(--spacing) * 7) 0;
  border-bottom: 1px solid var(--aus-line);
  color: var(--aus-ink);
  text-decoration: none;
}

.contact__links a > span {
  display: grid;
  gap: calc(var(--spacing) * 1);
  color: var(--aus-muted);
  font-size: var(--text-sm);
}

.contact__links strong {
  color: var(--aus-ink);
  font-family: var(--font-serif);
  font-size: 1.6rem;
  font-weight: var(--font-weight-normal);
}

@media (max-width: 48rem) {
  .contact {
    grid-template-columns: 1fr;
  }
}
</style>
