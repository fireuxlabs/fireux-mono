export const buenoHostPropertyShape = {
  id: 'holiday-with-nats',
  portfolio_id: 'buenohost-live-properties',
  identity: {
    name: 'Penthouse Holiday Apartment',
    address_line: 'Hobachergassli',
    city: 'Matten bei Interlaken',
    postcode: '3800',
    country: 'Switzerland',
    place_id: 'holiday-with-nats',
    image_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=640&h=360&q=80',
    property_type: 'residential',
    unit_count: 1,
    estimated_value: 0,
    estimated_value_currency: 'CHF',
  },
  manual: {
    welcome: {
      welcome_note: 'Welcome to the Penthouse Holiday Apartment.',
      manager: 'Apartment Manager Natalie',
      phone: '+41 78 604 69 00',
      email: 'bookwithnats@gmail.com',
      address: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
      wifi_network: 'Penthouse',
      wifi_password: 'penthouse2020',
    },
    check_in: {
      check_in_time: 'Needs host confirmation',
      arrival_steps: 'Needs exact arrival and building entry steps',
      key_safe: 'Guests can use the key safe box when going out.',
      key_safe_location: 'Needs exact key safe location',
      key_safe_code: '2020',
      key_safe_warning: 'Never change the code.',
    },
    checkout: {
      checkout_time: '10:00 unless agreed otherwise.',
      dishes: 'Put leftover dishes in the dishwasher and start the cleaning cycle.',
      key_return: 'Return the key where you found it. Exact instruction needs confirmation.',
      tidy_state: 'Leave the apartment in the same tidy manner that you found it.',
      final_checks: 'Turn heating off and close windows and doors before leaving.',
      charges: 'Extra cleaning or damage caused by neglect may be charged.',
    },
    emergency: {
      police: '117',
      fire: '118',
      ambulance: '144',
      helicopter_rescue: '1414',
      hospital: 'Interlaken Hospital: +41 (0) 33 826 25 00, Weissenaustrasse 27, 3800 Interlaken',
      first_aid: 'Kitchen drawer to the right of the microwave.',
      walk_in_clinic:
        'Interlaken West train station, Bahnhofstrasse 28, 3800 Interlaken. Mon-Fri 08:00-12:00 and 13:00-18:00.',
      hani_emergency:
        'Interlaken Hospital, Weissenaustrasse 27, 3800 Unterseen. Out-of-hours medical service.',
      fire_equipment:
        'Smoke alarms are fitted. Fire extinguisher by the downstairs main entrance. Fire blanket under the kitchen sink.',
    },
    house_rules: {
      quiet_hours: 'No loud noise after 22:00. Leave the balcony by 22:00 because noise travels.',
      smoking: 'This is a non-smoking apartment. Smoking is only allowed on the balcony using the ashtray.',
      windows_doors: 'Close all windows and doors before going out.',
      bathrooms: 'Bathrooms are not wet rooms. Mop up water from floors to prevent leaks and damage.',
      beds_sofa: 'Do not eat in bed or on the sofa because stains are difficult to remove.',
      damage_notes: 'Water damage caused by rain, extra cleaning or damage caused by neglect may be charged.',
    },
    apartment_guide: {
      heating: 'Radiators have dials from 1 to 5. Do not put heating on high and open windows. Turn heating off on departure.',
      dishwasher: 'Select a program, add a dishwasher tab, then press start. Never put washing-up liquid in the dishwasher.',
      chargers: 'USB chargers are supplied. Do not take or move installed chargers.',
      games_books: 'Adult and children board games and books are available. Please treat them with respect.',
      iron_board: 'The ironing board is on the landing between the two bedrooms.',
      tv: 'Cable TV and DVDs are available.',
      tap_water: 'Tap water is 100% drinkable.',
    },
    rubbish_recycling: {
      rubbish_bags: 'Use the white AVAG bags provided under the sink.',
      main_bin: 'Put full bags in the grey container outside by visitor parking. Use the key to unlock the padlock.',
      recycling: 'The recycling container is on the balcony. Cardboard can go in recycling.',
      not_allowed: 'Do not put general garbage or food containers in recycling.',
    },
    parking: {
      parking_location: 'Underground parking is available. Bay number or garage access details need confirmation.',
      visitor_parking: 'Temporary visitor parking is to the right of the main entrance.',
      avoid: 'Do not leave the car engine running unnecessarily.',
    },
    local_guide: {
      shops: 'CO-OP supermarket is downstairs and open Mon-Sun 08:00-20:00. Lidl is open daily 08:00-21:00.',
      post_office: 'The Post Office is inside the CO-OP supermarket.',
      transport: 'The bus stop is on the main street by Tells restaurant. Use buses 104 and 105 for local connections.',
      taxis: 'Bahnhof Taxi: +41 (0) 33 822 50 50. A Taxi: +41 (0) 33 822 60 60.',
      bike_rentals:
        'Amacher Bike Shop rents electric bikes. Daniels Fun Rentals offers mountain bikes, scooters, ATVs, funcars, e-bikeboards and quads.',
      walking_west:
        'Walk left from the apartment, through the alley, then continue towards the main Interlaken high street and West station.',
      walking_ost:
        'Walk right from the apartment, left at the end of the road, over the roundabout and continue towards Ost station.',
      recommendations: 'Restaurant and things-to-do recommendations need host confirmation.',
    },
    updates: {
      current_notice: 'No current guest notices.',
      starts: '',
      expires: '',
    },
  },
}

export const buenoHostManualSectionTitles = {
  welcome: ['Welcome', 'i-lucide-home'],
  check_in: ['Check-in', 'i-lucide-key-round'],
  checkout: ['Checkout', 'i-lucide-door-open'],
  emergency: ['Emergency', 'i-lucide-siren'],
  house_rules: ['House Rules', 'i-lucide-clipboard-check'],
  apartment_guide: ['Apartment Guide', 'i-lucide-info'],
  rubbish_recycling: ['Rubbish & Recycling', 'i-lucide-recycle'],
  parking: ['Parking', 'i-lucide-car'],
  local_guide: ['Local Guide', 'i-lucide-map-pin'],
  updates: ['Updates', 'i-lucide-megaphone'],
}
