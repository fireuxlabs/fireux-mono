# Solution Search System
Authority: Internal planning
Updated: 2026-05-26

Purpose: make every app idea travel from business case to searchable solution route to real tool provisioning.

No matter how useful a tool is, it has weak internet value if no one searches for the problem it solves. FireUX solution planning must start with the customer's language, not our internal architecture names.

## The Map

Use this chain for every app and every solution idea:

```txt
Business case
  -> Audience
    -> Business problem
      -> Search intent
        -> /solutions/:slug
          -> Tool or workflow
            -> Provisioning
              -> Status
```

## Layer Rules

| Layer | Rule |
|---|---|
| Business case | Explain why the app should exist and what market pain it addresses. |
| Audience | Name the person we want to engage, such as owner, operator, manager, supplier, professional, host, or buyer. |
| Business problem | State the painful job in language the audience recognizes. |
| Search intent | Use phrases a real person might search. Avoid internal jargon. |
| Solution route | Use customer-language SEO slugs, not implementation names. |
| Tool or workflow | Identify what feature, console, public page, bridge, or app fulfills the intent. |
| Provisioning | Name the records, routes, seed data, console pages, sibling app handoffs, and runtime surfaces required. |
| Status | Mark the obligation honestly: `live`, `very-easy`, `bridge`, `planned`, or `later`. |

## Naming Rules

Good solution slugs sound like search phrases:

```txt
restaurant-menu-management
qr-code-restaurant-menu
guest-instructions-translator
cleaning-schedule-planner
property-compliance-tracker
find-seo-consultant
```

Weak solution slugs sound like internal concepts:

```txt
menu-engineering
language-layer
supplier-ingredient-workflow
runtime-console
entity-provisioning
```

Internal concepts can appear in the page body, docs, and implementation notes. They should rarely be the public route.

## Misebox Example

| Layer | Example |
|---|---|
| Business case | Turn the menu into a working kitchen system. |
| Audience | Restaurant owner or kitchen manager. |
| Business problem | My menu changes, allergens are hard to maintain, and prep lives in people's heads. |
| Search intent | restaurant menu management software |
| Solution route | `/solutions/restaurant-menu-management` |
| Tool or workflow | Menu console, dishes, sections, prices, allergens, recipes, prep, and public QR menu. |
| Provisioning | Kitchen record, menu records, dish records, public menu URL, QR bridge, console routes. |
| Status | `live`, `very-easy`, or `planned` depending on the specific connected workflow. |

## Required Checklist

Before adding a solution route, answer:

- Who is searching for this?
- What would they type into a search engine?
- Is the slug written in their language?
- Does the page solve one recognizable problem?
- Which app owns it?
- Does it bridge to a sibling app?
- What tool or workflow fulfills it?
- What records, routes, and console pages are needed?
- What is the current status?

## Output Targets

This map should feed:

- `docs/business-cases/*.md`
- app `/learn-more` pages
- app `meta.ts`
- app `solutions.md`
- `/solutions/*` pages
- console routes
- public routes
- seed/provisioning scripts
- future tool chrome and language chrome
