# Onboarding Thread

Updated: 2026-02-26
Goal: simplify onboarding so it works the same locally and in the browser.

Key decisions:
- Onboarding lives at /onboarding and is the single entry point.
- Product pages (/products/[slug]) are marketing-only.
- Module pages (/modules/[id]) are marketing-only.
- Onboarding pulls from the same product objects in Firestore (no separate module registry).

Open questions:
- Should onboarding be admin-only or public?
- Should onboarding be scoped by appId/tenant automatically or selectable?
- Do we need a short onboarding mode selector: local vs browser?

Next steps:
- Define the minimal onboarding steps that are the same in both modes.
- Define which steps diverge (asset upload to Firestore vs local file paths).
- Decide where onboarding progress is stored (Firestore vs local storage vs both).

#end
