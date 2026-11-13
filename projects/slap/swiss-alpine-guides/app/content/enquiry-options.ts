import { activities } from './activities'
import { tours } from './tours'
import { operator } from './operator'
export const enquiryOptions = [
  { id: 'general', name: 'General activity enquiry', heli: false, to: operator.email },
  ...activities.map(item => ({ id: item.slug, name: item.name, heli: item.heliski === true, to: item.heliski ? operator.heliEmail : operator.email })),
  ...tours.map(item => ({ id: item.id, name: item.route, heli: true, to: operator.heliEmail })),
  { id: 'rentals', name: 'Equipment rental', heli: false, to: operator.email },
  { id: 'gift-vouchers', name: 'Gift voucher', heli: false, to: operator.email },
]
