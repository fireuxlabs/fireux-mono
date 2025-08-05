<template>
  <section class="cta-section">
    <div class="cta-content">
      <h2>Ready to Transform Your Cleaning Business?</h2>
      <p>
        Join thousands of cleaning professionals who trust CleanBox to manage
        their operations, delight their clients, and grow their revenue.
      </p>
      <div class="stats">
        <div class="stat">
          <span class="stat-number">10,000+</span>
          <span class="stat-label">Happy Clients</span>
        </div>
        <div class="stat">
          <span class="stat-number">$2M+</span>
          <span class="stat-label">Revenue Processed</span>
        </div>
        <div class="stat">
          <span class="stat-number">99.9%</span>
          <span class="stat-label">Uptime</span>
        </div>
      </div>
      <div class="cta-buttons">
        <UButton to="/auth" size="lg" class="primary-cta">
          Start Free Trial
        </UButton>
        <UButton to="/auth" variant="outline" size="lg"> Get Started </UButton>
      </div>
      <p class="trial-info">
        <UIcon name="i-lucide-check-circle" class="check-icon" />
        14-day free trial • No credit card required • Cancel anytime
      </p>
    </div>
  </section>
</template>

<script setup>
// No additional script needed
</script>

<style scoped>
.cta-section {
  background: linear-gradient(
    135deg,
    var(--color-primary-50) 0%,
    var(--color-primary-100) 100%
  );
  padding: var(--space-16) var(--space-8);
  text-align: center;
  border-radius: var(--radius-xl);
  margin: var(--space-8) 0;
}

.cta-content h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  color: var(--color-gray-900);
}

.cta-content p {
  font-size: var(--text-lg);
  color: var(--color-gray-700);
  margin-bottom: var(--space-8);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stats {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
  margin: var(--space-8) 0;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary-600);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  font-weight: 500;
}

.cta-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin: var(--space-8) 0;
  flex-wrap: wrap;
}

.primary-cta {
  background: var(--color-primary-600);
  color: white;
}

.trial-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  margin-top: var(--space-4);
}

.check-icon {
  color: var(--color-green-500);
}

@media (max-width: 768px) {
  .cta-section {
    padding: var(--space-12) var(--space-6);
  }

  .cta-content h2 {
    font-size: var(--text-2xl);
  }

  .stats {
    gap: var(--space-6);
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .trial-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
