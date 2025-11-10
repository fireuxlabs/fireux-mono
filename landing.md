# Tenant Landing Follow-Up

We refreshed the FireUX, Niederhorn, and Richies tenant landing experiences with the new modular component stack. Before shipping, plan these clean-up tasks so the copy and calls-to-action line up with the finished apps:

- Verify every CTA route resolves to a real page (e.g. `/contact`, `/docs/niederhorn-stations`, `/inventory`). Update or stub pages where needed.
- Replace placeholder metrics and badges with live data sources or content assets per tenant.
- Review component props for duplication opportunities and extract shared constants if multiple tenants reuse copy patterns.
- Run an accessibility pass (contrast, keyboard focus, prefers-reduced-motion) on the landing layout.
- Add tenant-specific tests or visual snapshots once the landing components stabilize.

Revisit this checklist right before deployment to ensure the landing messaging matches the production feature set.
