# FireUX — Products & Revenue (Codex Thread)

Status: **Active**
Version: **v1**
Updated: 2026-02-05

This file is a Codex-owned working thread for “what we can sell” decisions.
It should stay practical and sale-driven (no platform-theory).

Primary context docs:
- `AI/gpt-chats/fireux-app.md` (FireUX main company app)
- `AI/gpt-chats/fireux-fireux.md` (FireUX ecosystem)
- `AI/gpt-chats/misebox-app.md` (strategic product, slower)
- `AI/gpt-chats/cleanbox-app.md` (Cleanbox main app)
- `AI/gpt-chats/richies.md` (real client anchor)

Automation:
- This file lives under `AI/` and will be picked up by the daily 3 AM scan/versioning.

---

## 1. Current Reality

- Cash constraint is the driver: we need revenue soon.
- We sell **working apps**, not FireUX as an abstract platform.
- FireUX exists to let us ship/sell repeatable apps without burning out.

---

## 2. Sanity Check (From Today’s Brainstorm)

These are the key “keep forever” statements:

- Sell working apps, not promises.
- Ecosystems beat custom work (a known starting point + known cost).
- White-label is leverage later, not a day-one requirement.
- FireUX stays lean; it sells indirectly by making apps feel real/legit.

### 2.1 What FireUX Can Sell (Simple Menu)

1. **Branded Business Apps (Primary Product)**

A ready-made app/website for a business.
- Based on an existing ecosystem (Cleanbox, Misebox)
- Branded for one company
- Hosted, maintained, updated
- Sold as:
  - One-time setup fee
  - Monthly subscription

This is the core, easiest sell.

2. **Ecosystem Memberships**

Access to a shared industry network.

Examples:
- Cleaning companies on Cleanbox
- Hospitality professionals or kitchens on Misebox

Includes:
- Public profile/listing
- Visibility in search
- Jobs (post or apply)

Sold as:
- Low monthly fee
- No dedicated app required

3. **Dedicated Apps Inside an Ecosystem**

A step up from membership.
- Same ecosystem benefits
- Plus a private branded app
- Faster, cheaper than custom development
- Shares SEO and infrastructure

Sold as:
- Higher setup fee
- Higher monthly subscription

4. **White-Label Apps**

Same app, different brand.
- Re-skinned versions of proven apps
- Hosted by you
- “Powered by FireUX” (optional)

Sold as:
- Monthly license
- Optional setup fee

Lower volume, higher leverage.

5. **Custom Client Apps**

Bespoke work, but on FireUX.
- Framed as “built on the FireUX platform”
- Uses existing systems and rules
- Not pure freelancing

Sold as:
- Project fee
- Optional ongoing subscription

Low volume, high trust.

6. **Paid Add-Ons**

Extras inside existing apps.

Examples:
- Extra team members
- Extra profiles
- Bookings
- Payments
- Advanced analytics
- Push notifications

Sold as:
- Monthly upgrades

7. **Setup & Onboarding Services**

One-time services.

Examples:
- App setup
- Branding
- Data import
- Domain & PWA setup

Sold as:
- Fixed one-off fees

8. **Support & Maintenance Plans**

Peace of mind.
- Priority support
- Small changes included
- Ongoing updates

Sold as:
- Monthly add-on

9. **Digital Products (Later)**

Developer-facing.

Examples:
- Boilerplates
- UI kits
- Firebase schemas
- Documentation

Sold as:
- One-time purchase

Focus (cash-first):
- Sell **#1** now (Cleanbox tenants), bundling **#7/#8** into setup + subscription.
- Treat **#2–#6** and **#9** as menu items we only activate after cloning + pricing is stable.

---

## 3. Where `fireux-app` Fits (Important)

`fireux-app` is not the thing customers buy directly.

Role:
- First-party brand surface (“Built on FireUX”).
- Host neutral modules (currently: `fireux-products`, `fireux-blogs`).
- Provide legitimacy for ecosystem apps and client apps.

Constraints (keep it boring on purpose):
- No pricing page (yet) unless a real sale forces it.
- No customer onboarding flows unless a real sale forces it.
- No customer dashboards unless demanded by real usage.
- No “platform” features unless forced by real sales.

Repo truth:
- `projects/fireux/fireux-app/nuxt.config.ts` defines `id: fireux-app`, role `global`, modules `fireux-products` + `fireux-blogs`.

### 3.1 FireUX tenant sandbox (future)

Repo:
- `projects/fireux/tenant`

Purpose:
- Safe sandbox to test modules + tenant wiring without polluting real ecosystems

Planned companion context file:
- `AI/gpt-chats/fireux-tennat.md` (planned; filename spelling TBD)

### 3.2 Ecosystem baseline (Canon)

Locked decisions:
- Core modules are internal-only plumbing (never marketed): `fireux-core`, `fireux-ecosystem-controller`, `fireux-nuxtfire`.
- Ecosystems are mandatory: every app resolves `fireux-${ecosystem}` (no ecosystem-less mode).
- `fireux-fireux` is the neutral default ecosystem. Its standard domain baseline is:
  - `fireux-products`
  - `fireux-blogs`
- Not standard in `fireux-fireux` (opt-in per ecosystem/app):
  - `fireux-places` (physical-world bias; not required for purely digital products)
  - `fireux-companies` (opinionated; promote to baseline only when mature)
  - Domain-heavy extensions (`fireux-jobs`, `fireux-kitchens`, `fireux-drop`, etc.)

Implementation note (current repo reality):
- Ecosystem defaults now set `fireux.products` + `fireux.blogs` in runtime config (fireux-fireux/cleanbox/misebox).
- Apps can still override via `modules: [[ 'fireux-products', { ... } ], 'fireux-blogs']` in `nuxt.config.ts`.

---

## 4. Ruthless Focus Cut (Next 3–6 Months)

### 4.1 One Paying App (Anchor)

Primary anchor:
- Richie’s (`projects/cleanbox/richies-reinigung`)

Rule:
- Any feature Richie doesn’t need is suspicious.

### 4.2 One Ecosystem To Push (Revenue Bias)

Near-term push:
- Cleanbox (fewer roles, fewer legal edges, clearer buyer: business owner)

Long-term strategic:
- Misebox (bigger vision, heavier operational/legal surface area)

Working split:
- Cleanbox pays sooner.
- Misebox matures slower.

### 4.3 Pricing Model (For Now)

Keep it simple:
- One setup fee.
- One monthly subscription.
- No add-ons, no tiers, no options menu (yet).

---

## 5. Product Ladder (Easiest → Hardest)

Order of attack:

1. A real client app (Richie’s) with a boring, stable value proposition.
2. A reusable ecosystem app (Cleanbox) that can be cloned into tenants fast.
3. White-label packaging of proven apps (only after (1) + (2) feel repeatable).
4. Marketplace complexity (Misebox jobs/applications, etc.) only when usage forces it.

Also intentionally defer:
- Add-ons / support plans / digital products (pricing + support overhead)

---

## 6. What “Cloneable” Means (Technical Definition)

Goal:
- “Richie’s → new tenant” in under an hour without special-case logic.

Minimum bar:
- Tenant app can ship with lean modules and branded landing.
- Global app carries the heavier modules.
- Config-driven identity: `ecosystem`, `id`, `role`, and `modules` live in `nuxt.config.ts`.

Repo facts observed today:
- `projects/cleanbox/cleanbox-app` is landing-first today (see `projects/cleanbox/cleanbox-app/app/pages/index.vue` + `projects/cleanbox/cleanbox-app/docs/gap.md`).
- `projects/cleanbox/richies-reinigung` is tenant + lean modules today (see `projects/cleanbox/richies-reinigung/nuxt.config.ts`).

---

## 7. Language / Legal Safety (Sales Copy Constraint)

We need to keep wording legally safe, but also not self-sabotage conversion.

Watch-outs:
- “Hire Richie” exists in Richie’s landing today (`projects/cleanbox/richies-reinigung/app/pages/index.vue`).
- Decide whether that wording is acceptable for a single-company service app.

---

## 8. Next Concrete Steps

1. Define “first paying offer” for Richie’s:
   - Setup fee amount
   - Monthly amount
   - What is included (bullet list)
   - Subscription boundary: what counts as “small improvements” per month (hard limits)
2. Make Cleanbox tenant cloning boring:
   - Tenant template checklist
   - Branding inputs required (logo/wordmark/cover, colors, contact CTAs)
3. Reduce promise surface:
   - Ensure landing CTAs don’t route to non-existent pages (or add placeholders).
4. Decide FireUX-app’s minimal sales role:
   - What it must contain to support credibility (and nothing else).

---

## 9. Open Questions (Answer When Ready)

- What is Richie’s actual paid “unit”?
  - Just a marketing site + contact funnel, or operational tooling soon?
- Who is the first 10 Cleanbox buyers (profile)?
- What’s the minimum scope that can be delivered repeatedly without support hell?

This is a solid, coherent v1. You’re not missing anything fundamental, and—importantly—you’ve already cut away most of the things that usually bloat this kind of doc.

What you asked for explicitly at the end is:

“From number 20 plus”
I’m going to interpret that as: extend this debrief with the remaining conclusions, clarifications, and locked decisions that emerged, without rewriting what already works.

Below is a clean continuation that fits your tone, scope, and Codex intent.

⸻

10. Channel Pricing (Locked)

We now explicitly support channel-based pricing for the same underlying tenant app.

Channels
	1.	FireUX-routed (Assisted Placement)
	•	Client contacts FireUX directly
	•	FireUX qualifies + routes to an ecosystem
	•	FireUX acts as operator/broker
Outcome:
	•	Lower “operator rate”
	•	Not publicly advertised
	•	Used to seed ecosystems and close deals quickly
	2.	Ecosystem-direct (Retail)
	•	Client lands on Cleanbox / Misebox directly
	•	Self-identifies with the industry brand
	•	Buys into the ecosystem promise
Outcome:
	•	Higher public price
	•	Brand-led value (belonging, network, identity)
	•	Price can increase over time as ecosystem matures

Rule (Canon):

Same app, different channel, different price — as long as they are never shown side by side.

⸻

11. Early Pricing Posture (Time-Based, Not Absolute)

We are not setting “forever prices”.

Instead:
	•	Prices reflect current ecosystem value
	•	Early adopters are grandfathered
	•	New tenants pay the current public rate

Misebox example (illustrative, not final):
	•	Launch phase: CHF 25 / month
	•	Growth phase: CHF 35 / month
	•	Mature phase: CHF 50 / month

FireUX-routed placements can remain at operator rate even as public pricing increases.

⸻

12. Ecosystem User vs Tenant (Important Structural Split)

Ecosystems are not just “apps for businesses”.

Each ecosystem has two participation layers:

1. Ecosystem Users (Non-App)
	•	Individuals / professionals
	•	No dedicated app
	•	Participate via profiles, search, jobs, visibility

Purpose:
	•	Seed demand
	•	Create network value
	•	Increase tenant ROI

Pricing:
	•	Free (initially)
	•	Optional low-cost tier later if commitment is needed

2. Ecosystem Tenants (Businesses)
	•	Kitchens, cleaning companies, etc.
	•	Pay to access users + visibility
	•	May or may not have a dedicated app

This separation is non-negotiable for long-term value.

⸻

13. Product Routing (Canon, Final)

All sales conversations resolve to one of these outcomes:
	1.	FireUX App
Generic, neutral, hosted app.
	2.	Industry App (Tenant)
Business routed into an existing ecosystem (Cleanbox, Misebox).
	3.	White-Label App
Single client, rebranded, hosted.
	4.	Ecosystem White-Label
Operator runs a branded ecosystem (existing or new).
	5.	Template + Modules
Developer, self-hosted, no SaaS.

Everything else (setup, support, add-ons) is secondary and only activated when needed.

⸻

14. Ecosystem Bias (Intentional)

We explicitly prefer:
	•	Existing ecosystems
	•	Known domains
	•	Shared infrastructure

Reasons:
	•	Faster delivery
	•	Lower support cost
	•	Shared marketing upside
	•	Revenue share alignment

New ecosystems are supported, but:
	•	More expensive
	•	Slower to launch
	•	Treated as exceptions, not defaults

⸻

15. FireUX Core Positioning (Internal Only)

FireUX is not sold as a platform today.

Externally:
	•	FireUX = “Built with FireUX”
	•	Credibility + consistency signal

Internally:
	•	FireUX = leverage engine
	•	Prevents burnout
	•	Makes cloning boring

Any feature not required to:
	•	close sales
	•	support tenants
	•	maintain credibility

…is deferred.

⸻

16. Clone Speed Is the North Star

Every product decision is evaluated against:

“Can we ship a new tenant in under 1 hour?”

If not:
	•	Feature is suspect
	•	Scope is too wide
	•	Or belongs in ecosystem/global app, not tenant

⸻

17. Language Discipline (Sales Safety)

We avoid:
	•	“Platform”
	•	“Ecosystem-first framework”
	•	“Modular architecture”

We prefer:
	•	“Professional app”
	•	“Hosted and maintained”
	•	“Built for your industry”
	•	“We handle the technical side”

Legal + clarity beats cleverness.

⸻

18. What We Are Not Doing (Explicit Non-Goals)

For the next phase, we are not:
	•	Building complex pricing tiers
	•	Selling add-ons aggressively
	•	Opening marketplaces prematurely
	•	Supporting arbitrary custom workflows
	•	Chasing “power users” at the cost of simplicity

⸻

19. Success Metric (Very Simple)

Short-term success is not:
	•	GitHub stars
	•	Feature count
	•	Perfect abstractions

It is:
	•	Paying tenants
	•	Low support load
	•	Repeatable onboarding
	•	Calm development pace

⸻

20. Final Canon Summary (One Page)
	•	FireUX sells apps, not a platform.
	•	Ecosystems are the default delivery vehicle.
	•	Cleanbox pays sooner; Misebox compounds later.
	•	Channel pricing is intentional and allowed.
	•	Users create value; tenants pay for access.
	•	Clone speed beats flexibility.
	•	If Richie doesn’t need it, we don’t build it.

⸻

If you want, next logical Codex threads would be:
	•	“First Paid Offer: Richie’s (Exact Scope + Price)”
	•	“Cleanbox Tenant Onboarding Checklist (1-hour rule)”
	•	“Pricing & Grandfathering Policy (Internal)”

But as a products & revenue debrief, this is coherent, defensible, and executable.