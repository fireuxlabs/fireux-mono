<!-- COMMENT: app/components/layouts/default/Footer.vue -->
<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <LogoBrand />
      </div>
      <p class="footer-text">
        &copy; {{ new Date().getFullYear() }} FIReUX. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: var(--bg);
  padding: var(--space-4);
  text-align: center;
  width: 100%;
  border-top: 1px solid var(--border);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  max-width: 1200px;
}

.footer-logo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-text {
  font-size: var(--text-sm);
  color: var(--text);
}
</style>
