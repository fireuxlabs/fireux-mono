export type OrderingPageFamily =
  | 'Delivery'
  | 'Pickup'
  | 'On-premise'
  | 'Scheduled'
  | 'Marketplace'
  | 'Guest stay'
  | 'Prepared food'

export type OrderingPageKey =
  | 'delivery'
  | 'room-service'
  | 'collection'
  | 'takeaway-ordering'
  | 'click-and-collect'
  | 'curbside-pickup'
  | 'drive-thru'
  | 'dine-in'
  | 'table-ordering'
  | 'bar-tab'
  | 'counter-service'
  | 'kiosk-self-order'
  | 'pre-order'
  | 'reservation-pre-order'
  | 'catering-orders'
  | 'private-event-orders'
  | 'tasting-menu'
  | 'marketplace-ordering'
  | 'airbnb-guest-guide'
  | 'guest-local-recommendations'
  | 'holiday-rental-meal-deals'
  | 'private-chef-for-airbnb'
  | 'airbnb-catering'
  | 'meal-prep'
  | 'weekly-meal-prep'
  | 'mise-en-place-hampers'
  | 'dinner-boxes'
  | 'holiday-rental-food-hampers'

export type OrderingPageScreenKind =
  | 'basket'
  | 'allergen'
  | 'delivery-zone'
  | 'delivery-fulfilment'
  | 'collection-rendezvous'
  | 'collection-kitchen'
  | 'pre-order-details'
  | 'pre-order-kitchen'
  | 'review'
  | 'payment'
  | 'mock'

export type OrderingPageScreen = {
  kind: OrderingPageScreenKind
  title: string
  body: string
  icon?: string
  mockTitle?: string
  mockBody?: string
}

export type OrderingPageContent = {
  eyebrow: string
  title: string
  intro: string
  primaryLabel: string
  primaryTo: string
  screens: OrderingPageScreen[]
}

export type OrderingPageCard = {
  key: OrderingPageKey
  family: OrderingPageFamily
  title: string
  subtitle: string
  body: string
  icon: string
  to: string
}

export const orderingPageFamilies = [
  'Delivery',
  'Pickup',
  'On-premise',
  'Scheduled',
  'Marketplace',
  'Guest stay',
  'Prepared food',
] as const satisfies readonly OrderingPageFamily[]

export const orderingPageCards = [
  card('delivery', 'Delivery', 'Restaurant delivery', 'Address, area, kitchen, driver, payment.', 'Food delivery ordering for restaurants that need zone checks, timing, drivers, and online payment.', 'i-lucide-bike'),
  card('room-service', 'Delivery', 'Hotel room service', 'Room destination, kitchen timing, room charge or card.', 'Room service ordering for hotels, aparthotels, resorts, and serviced accommodation.', 'i-lucide-bed-double'),
  card('collection', 'Pickup', 'Collection orders', 'Pickup timing without delivery overhead.', 'Collection ordering for guests who will come to the counter, bar, or venue.', 'i-lucide-shopping-bag'),
  card('takeaway-ordering', 'Pickup', 'Takeaway ordering', 'Order ahead, collect hot, skip phone calls.', 'Takeaway ordering for restaurants, pubs, cafes, and snack bars.', 'i-lucide-package-check'),
  card('click-and-collect', 'Pickup', 'Click and collect', 'Online ordering with a clear collection promise.', 'Click-and-collect food ordering for kitchens that want a fast pickup lane.', 'i-lucide-mouse-pointer-click'),
  card('curbside-pickup', 'Pickup', 'Curbside pickup', 'Vehicle details plus pickup rendezvous.', 'Curbside pickup for venues where staff bring the order out to the customer.', 'i-lucide-car-front'),
  card('drive-thru', 'Pickup', 'Drive-thru ordering', 'Queue-aware pickup for car-based service.', 'Drive-thru ordering for kitchens that need speed, lanes, and pickup windows.', 'i-lucide-car'),
  card('dine-in', 'On-premise', 'Dine-in ordering', 'Table, bar, and service-point ordering.', 'Dine-in ordering for guests already inside the venue.', 'i-lucide-concierge-bell'),
  card('table-ordering', 'On-premise', 'QR table ordering', 'Scan, order, send to kitchen.', 'QR table ordering for restaurants, bars, beer gardens, hotels, and events.', 'i-lucide-qr-code'),
  card('bar-tab', 'On-premise', 'Bar tab ordering', 'Open a tab, add rounds, settle later.', 'Bar tab ordering for drinks-led venues, pubs, clubs, and hotel bars.', 'i-lucide-beer'),
  card('counter-service', 'On-premise', 'Counter service', 'Order at counter, route to kitchen or bar.', 'Counter-service ordering for cafes, quick-service restaurants, and food halls.', 'i-lucide-store'),
  card('kiosk-self-order', 'On-premise', 'Kiosk self-order', 'Self-service ordering for high-throughput venues.', 'Kiosk ordering for venues that want a screen-led service lane.', 'i-lucide-monitor-up'),
  card('pre-order', 'Scheduled', 'Pre-ordering', 'Future orders with acceptance and deposits.', 'Restaurant pre-ordering for guests who need a confirmed future collection, delivery, or meal.', 'i-lucide-calendar-clock'),
  card('reservation-pre-order', 'Scheduled', 'Reservation pre-order', 'Book a table and pre-select food.', 'Reservation pre-orders for groups, set menus, and kitchens that want prep certainty.', 'i-lucide-calendar-check'),
  card('catering-orders', 'Scheduled', 'Catering orders', 'Event details, quote review, deposit.', 'Catering order management for event food, buffets, business lunches, and private groups.', 'i-lucide-party-popper'),
  card('private-event-orders', 'Scheduled', 'Private event orders', 'Headcount, timing, location, acceptance.', 'Private event food ordering for venues, pop-ups, hotels, and event kitchens.', 'i-lucide-tickets'),
  card('tasting-menu', 'Scheduled', 'Tasting menu booking', 'Menu, date, party size, deposit.', 'Tasting menu ordering and deposits for chefs who need commitment before service.', 'i-lucide-sparkles'),
  card('marketplace-ordering', 'Marketplace', 'Marketplace ordering', 'External channel orders without losing kitchen control.', 'Marketplace-style ordering for Uber Eats, Just Eat, Misebox, and partner channels.', 'i-lucide-network'),
  card('airbnb-guest-guide', 'Guest stay', 'Airbnb guest guide', 'Recommendations, food options, partners, and host visibility.', 'BuenoHost-style guest guides for holiday rentals, chalets, apartments, and serviced stays.', 'i-lucide-house'),
  card('guest-local-recommendations', 'Guest stay', 'Local recommendations', 'Host-curated local tips that can become bookings or orders.', 'Local recommendations for guests, including restaurants, activities, transport, shops, and trusted partners.', 'i-lucide-map'),
  card('holiday-rental-meal-deals', 'Guest stay', 'Holiday rental meal deals', 'Partner meals for groups delivered to the stay address.', 'Meal deals for Airbnb and holiday-rental groups who want easy food at the property.', 'i-lucide-badge-percent'),
  card('private-chef-for-airbnb', 'Guest stay', 'Private chef for Airbnb', 'Freelance chefs tender for private dining at the property.', 'Private chef booking for guests staying in Airbnb, chalets, villas, and serviced apartments.', 'i-lucide-chef-hat'),
  card('airbnb-catering', 'Guest stay', 'Airbnb catering', 'Group catering for arrival meals, birthdays, and chalet nights.', 'Catering for holiday rentals where the stay address, headcount, and timing matter.', 'i-lucide-party-popper'),
  card('meal-prep', 'Prepared food', 'Meal prep marketplace', 'One place for local meal-prep companies and chefs.', 'A central meal-prep marketplace for customers who want variety without subscribing to five providers.', 'i-lucide-salad'),
  card('weekly-meal-prep', 'Prepared food', 'Weekly meal prep', 'Recurring plans across local kitchens and prep companies.', 'Weekly meal-prep ordering for customers who want fresh variety, dietary control, and reliable delivery.', 'i-lucide-calendar-days'),
  card('mise-en-place-hampers', 'Prepared food', 'Mise en place hampers', 'Chef-prepped ingredients, sauces, sides, and ready-to-cook packs.', 'Mise en place hampers for home cooks, private chefs, holiday rentals, and small events.', 'i-lucide-package-open'),
  card('dinner-boxes', 'Prepared food', 'Dinner boxes', 'Prepared meal boxes for groups, couples, and busy households.', 'Dinner boxes that combine local menus, prepared food, and simple finishing at home.', 'i-lucide-utensils'),
  card('holiday-rental-food-hampers', 'Prepared food', 'Holiday rental food hampers', 'Arrival-day food boxes for guests and hosts.', 'Food hampers for holiday rentals, from breakfast boxes to group meal kits and local produce.', 'i-lucide-shopping-basket'),
] as const satisfies readonly OrderingPageCard[]

export const orderingPageKeys = orderingPageCards.map((item) => item.key)

const sharedScreens = [
  {
    kind: 'basket',
    title: 'Basket',
    body: 'The guest sees the selected items and running total before Misebox asks for anything sensitive.',
  },
  {
    kind: 'allergen',
    title: 'Allergy check',
    body: 'A shared safety gate reminds guests that allergen and intolerance checks must happen before fulfilment starts.',
  },
] as const satisfies OrderingPageScreen[]

export const orderingPageContent: Record<OrderingPageKey, OrderingPageContent> = {
  delivery: deliveryContent('Delivery ordering', 'Delivery orders, without guesswork.', 'Misebox checks the basket, delivery area, kitchen timing, driver handoff, and payment before the order becomes operational truth.'),
  'room-service': roomServiceContent(),
  collection: pickupContent('Collection ordering', 'Collection that respects kitchen rhythm.', 'Collection keeps the menu flow familiar, then swaps delivery checks for a kitchen rendezvous and pickup timing.'),
  'takeaway-ordering': pickupContent('Takeaway ordering', 'Takeaway without the phone chaos.', 'Takeaway ordering gives guests a clear basket and pickup promise while the kitchen keeps control of timing.'),
  'click-and-collect': pickupContent('Click and collect', 'Click, pay, collect.', 'Click-and-collect keeps pickup simple for guests and useful for kitchen operations.'),
  'curbside-pickup': curbsideContent(),
  'drive-thru': driveThruContent(),
  'dine-in': onPremiseContent('Dine-in ordering', 'Table orders that still feel human.', 'Dine-in keeps ordering lightweight: basket, safety, table context, kitchen routing, review, and payment when needed.'),
  'table-ordering': onPremiseContent('QR table ordering', 'QR ordering for tables and terraces.', 'Guests scan, build a basket, and send the order to the right service point without losing the human hospitality layer.'),
  'bar-tab': barTabContent(),
  'counter-service': onPremiseContent('Counter service', 'Counter ordering with kitchen routing.', 'Counter service keeps guests moving while the kitchen receives clear, structured orders.'),
  'kiosk-self-order': kioskContent(),
  'pre-order': scheduledContent('Pre-ordering', 'Pre-orders that arrive prepared.', 'Pre-ordering adds notice, kitchen acceptance, and payment/deposit logic while keeping the guest journey compact.'),
  'reservation-pre-order': reservationPreOrderContent(),
  'catering-orders': cateringContent(),
  'private-event-orders': eventContent('Private event orders', 'Private event food orders with less back-and-forth.', 'Private event ordering captures the date, headcount, location, and payment commitment before the kitchen starts planning.'),
  'tasting-menu': eventContent('Tasting menu booking', 'Tasting menus with commitment built in.', 'Tasting menu ordering helps chefs manage party size, timing, dietary notes, and deposits before service.'),
  'marketplace-ordering': marketplaceContent(),
  'airbnb-guest-guide': guestStayContent('Airbnb guest guide', 'Guest guides that become local value.', 'BuenoHost turns a guest stay into local recommendations, partner offers, meal deals, and private chef opportunities.'),
  'guest-local-recommendations': guestStayContent('Local recommendations', 'Local recommendations that guests can act on.', 'Host-curated recommendations help guests discover trusted restaurants, activities, shops, transport, and local partners.'),
  'holiday-rental-meal-deals': guestMealDealContent(),
  'private-chef-for-airbnb': privateChefContent(),
  'airbnb-catering': airbnbCateringContent(),
  'meal-prep': mealPrepContent('Meal prep marketplace', 'One meal-prep doorway, many local providers.', 'Instead of subscribing to several meal-prep companies for variety, Misebox can centralise weekly food from local kitchens, chefs, and prep providers.'),
  'weekly-meal-prep': mealPrepContent('Weekly meal prep', 'Weekly meal prep with local variety.', 'Weekly meal prep lets customers build a recurring food plan from more than one local provider without losing order clarity.'),
  'mise-en-place-hampers': miseHamperContent(),
  'dinner-boxes': dinnerBoxContent(),
  'holiday-rental-food-hampers': holidayRentalHamperContent(),
}

export function isOrderingPageKey(value: string): value is OrderingPageKey {
  return orderingPageKeys.includes(value as OrderingPageKey)
}

function card(
  key: OrderingPageKey,
  family: OrderingPageFamily,
  title: string,
  subtitle: string,
  body: string,
  icon: string
): OrderingPageCard {
  return {
    key,
    family,
    title,
    subtitle,
    body,
    icon,
    to: `/ordering/${key}`,
  }
}

function deliveryContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'Try Bären delivery',
    primaryTo: '/menus/baeren-ringgenberg-delivery',
    screens: [
      ...sharedScreens,
      {
        kind: 'delivery-zone',
        title: 'Delivery zone',
        body: 'The guest chooses an address and Misebox checks whether the order can be delivered, including minimum order and zone fee.',
      },
      {
        kind: 'delivery-fulfilment',
        title: 'Fulfilment',
        body: 'The kitchen and delivery network start coordinating timing before the guest is asked to pay.',
      },
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function roomServiceContent(): OrderingPageContent {
  return {
    eyebrow: 'Room service ordering',
    title: 'Room service without reception relay.',
    intro:
      'Room service captures the room destination, kitchen timing, payment route, and guest confirmation in one ordering flow.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Room destination', 'Room number, guest name, and internal delivery notes are collected before the kitchen accepts.', 'i-lucide-bed-double', 'Room 204', 'Deliver to room 204, guest Daniel Watson.'),
      mockScreen('Internal delivery', 'The kitchen coordinates with the hotel or runner rather than a public delivery driver.', 'i-lucide-hotel', 'Hotel runner', 'Send when ready, charge to room or pay online.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function pickupContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      {
        kind: 'collection-rendezvous',
        title: 'Pickup rendezvous',
        body: 'The guest chooses pickup and Misebox prepares a timing conversation with the kitchen.',
      },
      {
        kind: 'collection-kitchen',
        title: 'Kitchen timing',
        body: 'The kitchen confirms when the order can be ready, so payment and pickup happen against a real promise.',
      },
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function curbsideContent(): OrderingPageContent {
  return {
    eyebrow: 'Curbside pickup',
    title: 'Curbside pickup with vehicle context.',
    intro:
      'Curbside pickup adds car details to the pickup flow so staff can hand over the order without guessing.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      {
        kind: 'collection-rendezvous',
        title: 'Pickup rendezvous',
        body: 'The guest chooses a pickup moment and the kitchen confirms the ready time.',
      },
      mockScreen('Vehicle details', 'Vehicle colour, plate, and parking point help staff find the customer.', 'i-lucide-car-front', 'Blue VW Golf', 'Waiting outside the main entrance.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function driveThruContent(): OrderingPageContent {
  return {
    eyebrow: 'Drive-thru ordering',
    title: 'Drive-thru ordering for fast lanes.',
    intro:
      'Drive-thru ordering keeps the basket structured, the kitchen informed, and the collection lane moving.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Drive-thru lane', 'The guest joins a lane or pickup window rather than a table or delivery address.', 'i-lucide-car', 'Lane 1', 'Prepare for pickup at window 2.'),
      {
        kind: 'collection-kitchen',
        title: 'Kitchen timing',
        body: 'The kitchen confirms the ready window before payment or pickup.',
      },
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function onPremiseContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Table context', 'The basket connects to a table, bar, room, or staff handoff without leaving the menu.', 'i-lucide-map-pin', 'Table 8', 'Send food to table 8, drinks to the bar.'),
      mockScreen('Service handoff', 'The order reaches the right station while staff can still step in, adjust, or confirm in person.', 'i-lucide-concierge-bell', 'Staff handoff', 'Route to kitchen, bar, or floor team.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function barTabContent(): OrderingPageContent {
  return {
    eyebrow: 'Bar tab ordering',
    title: 'Open a tab, add rounds, settle cleanly.',
    intro:
      'Bar tab ordering lets guests add drinks or food to a running tab while staff keep control of service.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Tab context', 'The order attaches to an existing tab or starts a new one.', 'i-lucide-beer', 'Daniel’s tab', 'Add this round to the open bar tab.'),
      mockScreen('Send to bar', 'The bar receives the order as a station task, not a kitchen-only ticket.', 'i-lucide-wine', 'Bar station', 'Prepare drinks and keep the tab open.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function kioskContent(): OrderingPageContent {
  return {
    eyebrow: 'Kiosk self-ordering',
    title: 'Self-ordering for busy service.',
    intro:
      'Kiosk self-ordering gives guests a structured screen flow while the venue keeps the same kitchen order spine.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Kiosk station', 'The order is attached to a physical kiosk, counter, or pickup number.', 'i-lucide-monitor-up', 'Kiosk 2', 'Print pickup number and send to kitchen.'),
      mockScreen('Pickup number', 'Guests track the order by number while staff work the queue.', 'i-lucide-hash', 'Order 42', 'Show order number and next steps.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function scheduledContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      {
        kind: 'pre-order-details',
        title: 'Schedule',
        body: 'The guest selects a future request context, with notice rules coming from the menu and kitchen policy.',
      },
      {
        kind: 'pre-order-kitchen',
        title: 'Kitchen acceptance',
        body: 'The kitchen confirms the request before the guest is asked for final payment or deposit.',
      },
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function reservationPreOrderContent(): OrderingPageContent {
  return scheduledContent(
    'Reservation pre-ordering',
    'Reservation pre-orders for calmer service.',
    'Reservation pre-orders connect table booking, menu choices, dietary notes, and deposits before the guests arrive.'
  )
}

function cateringContent(): OrderingPageContent {
  return {
    eyebrow: 'Catering orders',
    title: 'Catering orders that become workable briefs.',
    intro:
      'Catering ordering captures event size, timing, delivery or pickup, quote review, and payment commitment.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Event details', 'Headcount, date, location, delivery needs, and notes become part of the order.', 'i-lucide-party-popper', 'Business lunch', '24 people, 12:30, office delivery.'),
      mockScreen('Quote review', 'The kitchen can confirm, adjust, or quote before asking for deposit or payment.', 'i-lucide-clipboard-check', 'Quote review', 'Kitchen accepts or proposes a change.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function eventContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Event details', 'The order carries date, time, headcount, and venue context.', 'i-lucide-tickets', 'Private event', '18 guests, Saturday evening.'),
      {
        kind: 'pre-order-kitchen',
        title: 'Kitchen acceptance',
        body: 'The kitchen confirms the event order before payment or deposit.',
      },
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function marketplaceContent(): OrderingPageContent {
  return {
    eyebrow: 'Marketplace ordering',
    title: 'Marketplace-style ordering with kitchen control.',
    intro:
      'Marketplace ordering is for channels like Uber Eats, Just Eat, Misebox, or partner marketplaces where the order still needs to become a clean kitchen operation.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Channel context', 'The order records which marketplace or partner channel created the request.', 'i-lucide-network', 'Misebox channel', 'External order, internal kitchen spine.'),
      mockScreen('Kitchen routing', 'The kitchen sees the order in the same operational board rather than a disconnected tablet.', 'i-lucide-chef-hat', 'Kitchen console', 'Accept, time, print, and fulfil.'),
      reviewScreen(),
      paymentScreen(),
    ],
  }
}

function guestStayContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'Explore BuenoHost',
    primaryTo: '/solutions/buenohost',
    screens: [
      mockScreen('Stay context', 'The flow starts with the property, address, arrival date, group size, and host rules.', 'i-lucide-house', 'Interlaken apartment', '4 guests arriving Friday evening.'),
      mockScreen('Local recommendations', 'Guests see trusted host recommendations for restaurants, experiences, transport, shops, and local partners.', 'i-lucide-map', 'Host picks', 'Tap into curated local tips, not a generic tourist list.'),
      mockScreen('Partner offers', 'Recommendations can become meal deals, bookings, catering requests, or private chef tenders.', 'i-lucide-handshake', 'Local partners', 'Meal deal, chef tender, or activity booking.'),
      paymentScreen(),
      confirmationScreen('Guest itinerary', 'The guest receives an itinerary or booking reference while the host can keep visibility.'),
    ],
  }
}

function guestMealDealContent(): OrderingPageContent {
  return {
    eyebrow: 'Holiday rental meal deals',
    title: 'Meal deals delivered to the stay address.',
    intro:
      'Holiday-rental meal deals connect guest groups with partner kitchens that can serve the property address.',
    primaryLabel: 'Explore BuenoHost',
    primaryTo: '/solutions/buenohost',
    screens: [
      ...sharedScreens,
      mockScreen('Stay address', 'The order is tied to the rental address, arrival window, and group size.', 'i-lucide-map-pin-house', 'Matten apartment', '6 guests, delivery to the stay address.'),
      {
        kind: 'delivery-zone',
        title: 'Partner coverage',
        body: 'Misebox can check which partner kitchens serve the stay address and group size.',
      },
      mockScreen('Group meal offer', 'Guests choose a partner meal deal built for a group rather than individual takeaway chaos.', 'i-lucide-badge-percent', 'Tapas group box', 'Dinner for 6, delivered at 19:00.'),
      paymentScreen(),
      confirmationScreen('Stay meal confirmed', 'The guest gets the plan, the host keeps visibility, and the kitchen gets a structured order.'),
    ],
  }
}

function privateChefContent(): OrderingPageContent {
  return {
    eyebrow: 'Private chef for Airbnb',
    title: 'Let freelance chefs tender for guest stays.',
    intro:
      'Private chef ordering captures the stay context, group needs, budget, and timing before local chefs respond.',
    primaryLabel: 'Explore BuenoHost',
    primaryTo: '/solutions/buenohost',
    screens: [
      mockScreen('Stay context', 'Address, date, kitchen access, headcount, children, dietary needs, and occasion shape the brief.', 'i-lucide-house', 'Chalet dinner', '8 guests, birthday dinner, Saturday.'),
      mockScreen('Chef tender', 'Local freelance chefs can watch, accept, or offer a menu and price.', 'i-lucide-chef-hat', 'Chef tender', 'Chefs respond with menu, timing, and quote.'),
      mockScreen('Menu review', 'Guests compare offers and accept a chef before deposit or full payment.', 'i-lucide-clipboard-check', 'Chef proposal', 'Choose the menu and confirm the chef.'),
      paymentScreen(),
      confirmationScreen('Chef booked', 'The guest, host, and chef share the confirmed plan.'),
    ],
  }
}

function airbnbCateringContent(): OrderingPageContent {
  return {
    eyebrow: 'Airbnb catering',
    title: 'Catering for holiday rentals and group stays.',
    intro:
      'Airbnb catering captures group size, stay address, timing, delivery or service needs, quote review, and payment commitment.',
    primaryLabel: 'Explore BuenoHost',
    primaryTo: '/solutions/buenohost',
    screens: [
      ...sharedScreens,
      mockScreen('Group brief', 'Headcount, stay address, occasion, budget, and dietary needs become a workable catering brief.', 'i-lucide-users', 'Group catering', '12 guests, arrival dinner, vegetarian options.'),
      mockScreen('Quote review', 'Kitchens or chefs can confirm, adjust, or quote before payment.', 'i-lucide-clipboard-check', 'Catering quote', 'Review menu, delivery, service, and price.'),
      paymentScreen(),
      confirmationScreen('Catering confirmed', 'Guests and suppliers share one confirmed plan for the stay.'),
    ],
  }
}

function mealPrepContent(
  eyebrow: string,
  title: string,
  intro: string
): OrderingPageContent {
  return {
    eyebrow,
    title,
    intro,
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      mockScreen('Eating context', 'People, days, meals, dietary needs, cuisine preferences, and budget shape the plan.', 'i-lucide-list-checks', 'Weekly food plan', '2 people, 5 lunches, high protein, no nuts.'),
      mockScreen('Provider mix', 'Customers can choose one provider or mix meals from local meal-prep companies, chefs, and kitchens.', 'i-lucide-layout-grid', 'Mixed provider basket', 'Thai lunches, Swiss dinners, breakfast boxes.'),
      mockScreen('Schedule', 'One-time, weekly recurring, pickup, delivery, or arrival-day hamper.', 'i-lucide-calendar-days', 'Weekly delivery', 'Every Sunday evening, chilled delivery.'),
      {
        kind: 'delivery-zone',
        title: 'Delivery or pickup',
        body: 'Misebox can check address coverage, delivery fees, pickup options, and cold-chain windows.',
      },
      paymentScreen(),
      confirmationScreen('Meal plan confirmed', 'The customer gets provider breakdown, delivery plan, and reorder path.'),
    ],
  }
}

function miseHamperContent(): OrderingPageContent {
  return {
    eyebrow: 'Mise en place hampers',
    title: 'Chef-prepped hampers for cooking without chaos.',
    intro:
      'Mise en place hampers package prepared ingredients, sauces, sides, and finishing instructions from local kitchens or chefs.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      mockScreen('Cooking context', 'Guests choose the meal occasion, skill level, group size, and kitchen access.', 'i-lucide-cooking-pot', 'Dinner hamper', 'Four people, easy finish, apartment kitchen.'),
      mockScreen('Hamper contents', 'The hamper can include prepped ingredients, sauces, garnish, reheating notes, and partner products.', 'i-lucide-package-open', 'Mise box', 'Sauces, sides, chopped veg, finished protein.'),
      {
        kind: 'delivery-zone',
        title: 'Delivery or pickup',
        body: 'Misebox checks whether the hamper can be delivered or collected in time.',
      },
      paymentScreen(),
      confirmationScreen('Hamper confirmed', 'The customer receives the hamper plan, timing, and finishing guidance.'),
    ],
  }
}

function dinnerBoxContent(): OrderingPageContent {
  return {
    eyebrow: 'Dinner boxes',
    title: 'Dinner boxes from local kitchens.',
    intro:
      'Dinner boxes let households and groups order prepared food that is easy to heat, finish, or serve.',
    primaryLabel: 'View live menus',
    primaryTo: '/menus',
    screens: [
      ...sharedScreens,
      mockScreen('Dinner plan', 'Guests choose portions, dietary needs, finishing level, and preferred cuisines.', 'i-lucide-utensils', 'Friday dinner box', 'Dinner for 4 with dessert.'),
      {
        kind: 'delivery-zone',
        title: 'Delivery or pickup',
        body: 'Misebox checks the box delivery address, pickup option, or collection timing.',
      },
      paymentScreen(),
      confirmationScreen('Dinner box confirmed', 'The customer receives serving notes and the confirmed delivery or pickup time.'),
    ],
  }
}

function holidayRentalHamperContent(): OrderingPageContent {
  return {
    eyebrow: 'Holiday rental food hampers',
    title: 'Arrival food hampers for guests and hosts.',
    intro:
      'Holiday rental food hampers give guests breakfast boxes, local produce, meal kits, or arrival-day food at the property.',
    primaryLabel: 'Explore BuenoHost',
    primaryTo: '/solutions/buenohost',
    screens: [
      mockScreen('Stay context', 'The stay address, arrival time, guest count, and host preferences shape the hamper.', 'i-lucide-house', 'Arrival hamper', 'Breakfast for 5, arriving 18:00.'),
      mockScreen('Local hamper', 'Local suppliers, kitchens, and producers can provide food, drinks, and prepared items.', 'i-lucide-shopping-basket', 'Local box', 'Bread, cheese, fruit, drinks, dinner kit.'),
      {
        kind: 'delivery-zone',
        title: 'Property delivery',
        body: 'Misebox checks who can deliver to the rental address before or after arrival.',
      },
      paymentScreen(),
      confirmationScreen('Hamper scheduled', 'The guest and host know what arrives, when, and who supplies it.'),
    ],
  }
}

function reviewScreen(): OrderingPageScreen {
  return {
    kind: 'review',
    title: 'Review',
    body: 'The final check keeps the guest in control before payment or confirmation.',
  }
}

function paymentScreen(): OrderingPageScreen {
  return {
    kind: 'payment',
    title: 'Payment',
    body: 'Online card is the default fast path; other payment methods can be enabled by kitchen policy later.',
  }
}

function confirmationScreen(title: string, body: string): OrderingPageScreen {
  return {
    kind: 'mock',
    title,
    body,
    icon: 'i-lucide-circle-check',
    mockTitle: title,
    mockBody: body,
  }
}

function mockScreen(
  title: string,
  body: string,
  icon: string,
  mockTitle: string,
  mockBody: string
): OrderingPageScreen {
  return {
    kind: 'mock',
    title,
    body,
    icon,
    mockTitle,
    mockBody,
  }
}
