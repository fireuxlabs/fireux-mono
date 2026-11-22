# What a pizza order taught me about service layers

*By Daniel / deadon — learning and designing FireUX with Codex*

A customer chooses a pizza, picks a collection time and sends an order. The screen makes this look like one action. Behind it are several decisions: which Kitchen owns the food, whether its Menu is published, whether the selected offering accepts collection, what the pizza costs, and what must happen before preparation can begin.

Building this journey in Misebox with Codex has made the Service Layer pattern useful to me. The [Service Layer entry on Martin Fowler’s site](https://www.martinfowler.com/eaaCatalog/serviceLayer.html), credited to Randy Stafford, describes a boundary through which clients request application actions and their coordinated results. It gives us a way to discuss responsibility without starting with folders.

This is a design note from our current implementation, rather than a claim that FireUX has finished solving application architecture.

## Start with the food

Misebox is a concrete App built with FireUX. Its Kitchen Workspace lets an operator work with dishes, Menus and orders.

A Dish describes the food. A Kitchen Menu places that Dish in a catalogue through a Menu item. Publication makes the Menu available through its public presentation. These are related records with different jobs: editing a dish is different from publishing a Menu, and neither action means the Kitchen is accepting orders.

Commercial terms have their own detail. A Menu item can use its existing placement prices or explicitly adopt Kitchen-owned shared sellable terms. The latter carry stable variant and add-on identities. This adoption is incremental; the code supports both paths.

For an illustrative example, suppose a published Menu offers a Margherita for CHF 13, with an optional extra priced at CHF 2. Two pizzas with that extra give an item subtotal of CHF 30. Those numbers explain the calculation; they are not a statement about a live restaurant’s Menu.

The customer sends item references, quantities and choices. The server resolves the saved prices. A total displayed in the basket helps the customer decide, but does not authorize the amount stored on the Order.

## Three uses of “service”

We have to be careful with this word.

The App’s "'`/services/ordering` page introduces an ordering setup journey. A `KitchenService` is a named offering, such as Breakfast or Dinner: it has an identity, enabled state, eligible Menus, serving hours and permitted interactions. Collection and delivery are interactions an offering may support.

The technical service layer coordinates a use case. It brings together authority, domain rules, persistence and follow-up effects. A Breakfast record is an input to that work. A page named “Services” does not establish the architectural boundary.

That distinction also explains why a published Menu can remain browsable while ordering is unavailable.

## From a Tool to a trusted action

Our working product vocabulary is **Workspace → Capability → Tool → trusted command or workflow**.

The Kitchen Workspace supplies the operator’s working context. Orders is a capability. Accept order, Start preparation and Complete order are concrete Tools. Their controls call server-owned behavior; showing a button or selecting a Kitchen does not grant permission.

The customer enters through the public Menu rather than the operator Workspace. Both journeys meet the same domain records, but carry different authority.

```text
Dish → Menu item → Published Menu → Customer’s order request
                                            │
                        Server resolves scope, offering,
                        saved prices and fulfilment rules
                                            │
                                    Pending Order
                                            │
Kitchen Workspace → Orders → Accept order → Trusted Order action
                                            │
                              Customer chooses payment
                                            │
                            Scheduled / awaiting preparation
                                            │
                         Start preparation → Ready → Complete
                                                        │
                                            Sale + financial fact

Acceptance notification: separate work after acceptance commits.
Online payment, when offered: a separately verified provider interaction.
```

For a customer request, current code resolves the Menu’s owning App and Kitchen, requires a linked Place, checks source Menu publication and the selected service interaction, and resolves the requested items. Pickup validation checks the offered times against the service schedule, timezone, notice, interval and horizon.

Operator actions require an authenticated account, current App membership and a Kitchen association bound to that membership. Customer payment choices instead check the customer’s identity or the existing same-device capability, together with the exact Menu and App scope. These are distinct permissions, enforced on the server.

## Confirmation is a sequence

New Menu orders enter `pending_acceptance`. Kitchen acceptance moves them to payment choice. The customer can then choose a method offered by the saved policy.

Choosing deferred payment does not mean the order has been paid. An online method, when available, waits for verified payment. A scheduled collection then remains scheduled; other eligible requests await preparation. Starting preparation is an explicit operator action. Acceptance and payment do not automatically print a ticket.

This sequence matters more than the names of the components. A single “confirmed” flag would lose the difference between a Kitchen agreeing to an order, a customer choosing payment, and food entering preparation.

The browser still has useful responsibilities: displaying live status, holding an unfinished basket, calculating a preview and preventing an action from continuing after the selected account or Kitchen changes. Pure calculations can be shared and tested. The trusted boundary owns the decision to change persistent state.

## Be precise about what commits together

Completing an order provides a particularly clear example. The current Order action reads its state and applies the lifecycle rules. In one database transaction it updates the Order and creates the completed Sale and App financial fact. Those writes succeed or fail together.

That guarantee has a boundary. Operator access is checked before this transaction. Order creation also resolves Menu content, prices and service policy before its commit. We should not describe the whole journey as one atomic transaction or claim every earlier read is revalidated inside it.

Creation supports an idempotency key: repeating the same scoped request can return its saved result, while reusing the key for a different request is rejected. This is a specific retry contract, not a blanket promise of exactly-once execution.

Acceptance notification happens after the Order commit, in a separate identity-database transaction. Its stable identity prevents duplicate notification records; notification failure does not roll acceptance back. Online checkout and payment verification are separate provider interactions too. A database commit cannot guarantee that an external message was delivered or that a payment succeeded.

## Put the responsibility where its meaning lives

The ordering rules belong with the domain that understands Menus, Kitchen offerings and Orders. FireUX Core supplies reusable mechanics, including transaction support. It does not need to understand when a pizza may enter preparation.

Misebox’s App and ecosystem composition consume those domain capabilities and supply product entry points, configuration and presentation. This is what we mean by keeping behavior with the lowest owner of its complete meaning and authority. Lower placement is useful only when that owner can actually explain the whole action.

Our implementation is still uneven. Operator transitions already pass through a named Order action behind a thin HTTP adapter. Customer order creation still coordinates several domain helpers in its HTTP handler. Calling both “service-layer work” explains their responsibility; it does not pretend their extraction is equally complete.

Capacity per pickup slot, date-specific closures and expiry of unanswered requests are unfinished. This source review also establishes neither production deployment nor production security readiness.

The practical lesson I am taking forward with Codex is to trace one real action before naming another layer: who requests it, which owner decides, what changes together, and what can fail afterwards? For Misebox, following a pizza through an order gives those questions concrete answers—and makes the remaining gaps easier to name.
