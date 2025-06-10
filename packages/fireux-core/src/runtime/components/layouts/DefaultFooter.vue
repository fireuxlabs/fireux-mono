<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <FireLogoType size="small" />
      </div>
      <div class="footer-links">
        <a href="#" class="footer-link">Terms</a>
        <a href="#" class="footer-link">Privacy</a>
        <a href="#" class="footer-link">Help</a>
      </div>
      <div class="footer-copyright">
        © {{ new Date().getFullYear() }} FireUX. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
defineOptions({
  name: 'FireLayoutsDefaultFooter',
})
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: var(--color-background-muted);
  padding: var(--space-4) 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-4);
}

.footer-links {
  display: flex;
  gap: var(--space-6);
}

.footer-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-copyright {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
