# Misebox/Sproochli Customer Lanes
Authority: Internal planning
Updated: 2026-06-06

Purpose: choose the right customer lane before touching code, data, or deployment.

## Core Rule
Misebox is for structured restaurant operations. Sproochli is for translation. Go QR is for lightweight entry points. Ordering should not wait for translation.

Before building, classify the customer as:
- light entrant
- structured multilingual menu
- ordering-first venue
- language-cache investigation

## Product Boundaries
| Product | Job | Does not own |
|---|---|---|
| Misebox | Structured kitchens, dishes, menus, sellable items, ordering, prep, suppliers, and operators. | Generic translation hosting. |
| Sproochli | Translation capability for app-owned public content. | Misebox kitchen, dish, menu, ordering, or venue truth. |
| Go QR | Lightweight QR entry points and scannable handoffs. | Structured restaurant operations or translation review. |
| Ordering | Fast commercial selling flow for a venue. | Translation readiness as a blocker. |

## Lane Matrix
| Lane | Use when | Source truth to gather | Dishes required? | Product path |
|---|---|---|---|---|
| Light entrant | The venue is only entering the system or testing interest. | Uploaded menu, URL, QR target, contact, lead details. | No. | Go QR, uploaded menu, translation preview, lead capture. |
| Structured multilingual menu | The venue needs a real deployed translated menu. | Original menu text, prices, languages, menu sections, dish copy. | Yes. | Misebox dish/menu structure plus Sproochli translation capability. |
| Ordering-first venue | The venue needs customers to buy now. | Sellable item names, prices, availability, pickup/delivery rules, contact flow. | Yes, or dish-backed sellable items. | Misebox ordering surface first; translation later. |
| Language-cache investigation | A requested language is missing or stale. | Source text, requested language, existing cache, expected public output. | Depends on source lane. | Generate on demand, then cache for future use. |

## Current Case Decisions
| Case | Lane | One-sentence job |
|---|---|---|
| Entrants | Light entrant | Help them enter the system without forcing a fully modelled kitchen. |
| La Tap Berne | Structured multilingual menu | Prove deployed menu translation from stable dish/menu source text. |
| Luna Piccante | Structured multilingual menu | Prove a real multilingual restaurant menu while preserving original menu voice. |
| Baeren Ringgenberg | Ordering-first venue | Get sellable items online quickly without waiting for Sproochli. |
| Languages outside cache | Language-cache investigation | Generate missing languages on demand and cache them for repeat guests. |

## Dish Rule
- Dishes are not needed for first-contact entrants.
- Dishes are needed for serious menu translation.
- Dishes or dish-backed sellable items are needed for ordering.
- Menu items place and price dishes; they do not become the food truth.
- Order items sell the thing; they do not invent a second menu model.

## Human Acceptance Checks
Before coding or data work, answer:
- Can this customer be explained in one sentence?
- Can Barbara or David understand the next action without developer language?
- Can a guest open the menu or order page and understand what to do?
- Can we point to the exact source text being translated or sold?
- Can we say "light entrant" or "structured kitchen" before building?

## Review Posture
Review output like a normal bar or restaurant owner:
- Is the menu readable?
- Are prices clear?
- Is the guest action obvious?
- Is the operator action obvious?
- Is the system asking for structure only when structure pays off?
