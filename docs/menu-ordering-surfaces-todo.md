# Menu ordering surfaces TODO

Status: Working checklist; non-authoritative  
Updated: 2026-07-18

This checklist tracks the incremental Menu ordering work. The current source,
guards, [`docs/concepts/family-menu.md`](concepts/family-menu.md), and
[`docs/concepts/menu-ordering.md`](concepts/menu-ordering.md) remain the
authority.

## Shared ordering configuration

- [ ] Enabled or disabled.
- [ ] Customer-facing message.
- [ ] Inherit Menu service hours or override them.
- [ ] Temporary operational state: open, paused, or overloaded.
- [ ] Minimum notice.
- [ ] ASAP availability.
- [ ] Slot interval.
- [ ] Scheduling horizon.
- [ ] Payment methods.
- [ ] Acceptance policy.
- [ ] Required customer details.
- [ ] Order notes and allergy information.
- [ ] Public availability/status treatment.

## Browse

Browse is a readable Menu projection, not an ordering surface.

- [ ] Preserve Menu theme and layout.
- [ ] Preserve currency display configuration.
- [ ] Render Menu sections and items.
- [ ] Show only public ordering options.
- [ ] Never advertise Kiosk, Table QR, or Room Service as ordinary public
  doorways.

## Collection

- [x] Independent service hours.
- [x] ASAP or scheduled collection.
- [x] Minimum notice, slot interval, and scheduling horizon.
- [x] Cash, card on collection, or online payment configuration.
- [x] Kitchen acceptance pipeline.
- [x] Collection location and handoff instructions.
- [x] Required versus optional name, mobile, and email fields.
- [x] Temporary Collection pause control with customer-facing message.
- [ ] Final confirmation and rejection messaging.
- [ ] Restore order status after refresh.
- [ ] Complete online-payment testing.

## Delivery

- [ ] Independent delivery hours.
- [ ] Delivery zones.
- [ ] Postal-code, place, or polygon matching.
- [ ] Minimum order per zone.
- [ ] Delivery fee per zone.
- [ ] Estimated delivery time.
- [ ] Address and delivery-instruction fields.
- [ ] Cash, card to driver, or online payment configuration.
- [ ] Driver assignment or tendering policy.
- [ ] Temporary Delivery pause control.
- [ ] Unavailable-area recovery.

## Pre-order

- [ ] Require a scheduled time.
- [ ] Earliest notice.
- [ ] Furthest booking horizon.
- [ ] Daily cutoff time.
- [ ] Available dates and slots.
- [ ] Deposit or full-payment policy.
- [ ] Kitchen acceptance policy.
- [ ] Cancellation deadline.
- [ ] Decide the eventual handoff: Collection, Delivery, Dine-in, or an
  event-specific handoff.

Pre-order describes timing but does not, by itself, describe how the customer
receives the order. That boundary must be agreed before implementing the full
funnel.

## Table QR / Dine-in

This is a private, table-specific QR doorway.

- [ ] Supply table identity through the QR entry.
- [ ] Reject missing or invalid table identity.
- [ ] Configure table-service hours.
- [ ] Support online payment, payment at the table, or a table tab.
- [ ] Configure automatic submission versus staff acceptance.
- [ ] Configure table handoff and service instructions.
- [ ] Support additional rounds against an existing table tab.
- [ ] Never advertise it as an ordinary public Menu option.

## Kiosk

This is a private device doorway containing Eat here and Take away choices.

- [ ] Kiosk device identity.
- [ ] Kiosk skin.
- [ ] Eat-here and takeaway choices.
- [ ] Payment-terminal configuration.
- [ ] Receipt and ticket printer configuration.
- [ ] Automatic acceptance policy.
- [ ] Idle timeout and basket reset.
- [ ] Out-of-service control.
- [ ] Never advertise it as an ordinary public Menu option.

## Room service

This is a private, room-specific QR doorway.

- [ ] Supply room identity through the QR entry.
- [ ] Reject missing or invalid room identity.
- [ ] Independent room-service hours.
- [ ] Guest name or booking verification.
- [ ] Room-charge eligibility.
- [ ] Online payment, room charge, or payment on delivery.
- [ ] Tray or service fee and minimum order.
- [ ] Delivery estimate.
- [ ] Room-service instructions.
- [ ] Kitchen acceptance.
- [ ] Never advertise it as an ordinary public Menu option.

## Suggested implementation order

1. Finish and harden Collection.
2. Reuse the shared timing, payment, and configuration molecules for Delivery.
3. Add Delivery zones and address handling.
4. Build Pre-order scheduling on the shared timing seam.
5. Implement the private QR surfaces: Table QR, Room Service, then Kiosk.
