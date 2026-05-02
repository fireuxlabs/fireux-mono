# Deanos Menu Canon

Authority: Operational product note
Updated: 2026-05-02
Scope: Misebox demo kitchen concept for Deanos.

This note defines the intended Deanos menu direction before we enrich dishes, recipes, mise, ingredients, and supplier links. It is not a data migration spec yet.

## Brand

Deanos is a smashed burger kitchen concept that should feel credible as a small chain or franchise.

The menu should prove:

- Clear hero products.
- Repeatable kitchen operations.
- Strong visual identity.
- Easy customer ordering.
- Good margin structure.
- A menu shape that can scale across locations.

## Menu Shape

Deanos should present one coherent brand menu first:

```text
Deanos Main Menu
```

Later, the system can expose service-specific menu surfaces:

```text
Main Menu
Kids Menu
Late Night Menu
Delivery Menu
Kiosk Menu
QR Menu
```

Those are surfaces, not separate brand concepts.

## Categories

```text
Smashed Burgers
Chicken
Veggie
Fries
Kids
Dips
Extras
```

## Product Set

### Smashed Burgers

- Deanos Classic - flagship double-smash burger with American cheese, house sauce, lettuce, pickles, and potato bun.
- Double Deanos - bigger upsell version of the house burger.
- Bacon Jam Smash - premium sweet/salty burger built for photos and margin.
- Swiss Melt - local Swiss angle with alpine or raclette-style cheese.

### Chicken

- Hot Honey Chicken - modern crowd-pleaser and strong delivery item.
- Deluxe Chicken - clean classic chicken option with broad appeal.

### Veggie

- Crispy Halloumi Smash - vegetarian burger with strong texture.
- Mock Duck Bao - distinctive non-burger veggie/plant-forward option.

### Fries

- Skin-On Fries - base side.
- Cheesy Fries - simple upsell.
- Deluxe Fries - loaded side that can become a hero add-on.
- Hot Honey Fries - brandable side linked to the chicken sauce system.

### Kids

- Lil Dinos Beef - small beef burger meal.
- Lil Dinos Chicken - small chicken burger meal.

### Dips

- House Dip - signature repeatable sauce.
- Ranch.
- Garlic and Herb.
- BBQ.
- Truffle Mayo.
- Hot Honey.

### Extras

- Pickles.
- Cheese.
- Crispy Onions.
- Bacon.
- Jalapenos.

## Signature Items

The first demo pass should make these feel especially real:

- Deanos Classic.
- Double Deanos.
- Hot Honey Chicken.
- Bacon Jam Smash.
- Swiss Melt.
- Deluxe Fries.
- House Dip.

These are the products that should carry imagery, recipes, mise, and supplier links first.

## Pricing Direction

Prices should feel like a Swiss casual burger kitchen:

- Core burgers: CHF 17-21.
- Premium burgers: CHF 22-25.
- Chicken/veggie: CHF 17-22.
- Fries: CHF 6-12.
- Kids: CHF 10-13.
- Dips: CHF 2-3.
- Extras: CHF 2-5.

The exact demo prices should be set in menu item records because menu price is presentation/sales context, not dish identity.

## Ops Links

The menu should demonstrate the Misebox stack:

```text
Dish
-> Recipe
-> Mise
-> Ingredients
-> Suppliers
```

Example:

```text
Deanos Classic
-> House burger sauce recipe
-> Shredded lettuce mise
-> Sliced pickles mise
-> Beef patties ingredient
-> Potato buns ingredient
-> City Butchers / Daily Bakehouse supplier links
```

## Rollout Order

1. Align demo dishes to this product set.
2. Align menu records to present those dishes in the categories above.
3. Add dish descriptions and images where missing.
4. Add recipes for signature items.
5. Add mise and ingredient links.
6. Add supplier/product links.
7. Add menu availability and service-surface rules.

## Non-Goals For This Pass

- Do not add menu nav status chips yet.
- Do not create a new menu model.
- Do not store derived menu images yet.
- Do not split the brand into many separate public menus yet.
- Do not wire ordering, Stripe, or subscriptions yet.
