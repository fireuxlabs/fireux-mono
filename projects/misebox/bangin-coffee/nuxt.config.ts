import { defineFireuxApp, type FireuxAppConfig } from 'fireux-app/config'

const app: FireuxAppConfig = {
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
}

export default defineFireuxApp({
  ...app,
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
  ],
})
