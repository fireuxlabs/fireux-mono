Authority: Operational diary for Misebox safety/product diligence
Updated: 2026-05-29

# Misebox Due Diligence Diary

Purpose: record practical steps taken to make Misebox menu experiences safer and clearer for guests, operators, and the FireUX team.

This is not legal advice, insurance advice, or a compliance certificate. It is a working diary of product decisions, risk notes, and future safety improvements.

## Principle

Misebox should help guests with allergies or intolerances take informed responsibility for themselves by making the safest next action visible before they order.

For now, the fail-safe action is simple:

> If you have a food allergy or intolerance, please speak to a member of the team before ordering.

This wording is shown directly on the public menu page, above the menu document. It is not hidden in a popup, modal, or dismissible notice.

## Diary

### 2026-05-29

Added a persistent allergen declaration to the public plain menu document route:

```txt
/menus/:menuId
```

Implemented on the uploaded menu page so the message appears before the hosted menu file/PDF viewer.

Reasoning:

- A popup can be dismissed, blocked, missed, or argued about later.
- A visible page notice becomes part of the menu-reading experience.
- Plain uploaded menus are not structured enough to make item-level allergen claims.
- Misebox should not imply that an uploaded PDF/DOC menu has been checked, parsed, translated, or allergen-verified.
- The safest current behaviour is to direct allergy-sensitive guests to speak with the venue team before ordering.

Current scope:

- Applies to plain uploaded menu docs hosted at `/menus/:menuId`.
- Does not yet provide dish-level allergen metadata.
- Does not yet provide user allergy profiles, allergy cards, or signed-in guest safety tools.

## Future Safety Ideas

- Allergy card: let a guest carry a saved allergy/intolerance card and open it from their phone.
- Signed-in guest profile: allow guests to reuse allergy information across Misebox venues.
- Venue acknowledgement: let a venue mark when a staff member has seen or discussed a guest's allergy card.
- Structured menu allergens: when menus become dishes/sections/items, show allergen and dietary data from structured Dish records.
- Translation safety: when Sproochli translates menus, keep allergy terms explicit and reviewable.
- Change diary: record when a venue replaces a menu document or upgrades a plain menu doc into a structured kitchen menu.

## Open Questions

- Should the allergen declaration be configurable per venue later, while keeping a safe default?
- Should plain menu docs require the allergen declaration before publishing?
- Should translated menu pages always show the allergen declaration in both the guest language and the venue's operating language?
- Should QR print pages include a smaller version of the same allergen declaration, or is the menu landing page enough?
