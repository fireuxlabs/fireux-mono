import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'bangin-coffee',
  context:
    'Bangin Coffee presents in-house roasted coffee served from a mobile bar, including its event offering. Booking-specific arrangements belong to the individual enquiry or agreement.',
  name: 'Bangin Coffee',
  shortName: 'Bangin Coffee',
  role: 'tenant',
  modules: ['fireux-go-qr'],
})
