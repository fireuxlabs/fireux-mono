import { enquiryOptions } from '../../app/content/enquiry-options'

export function validateEnquiry(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Complete the enquiry form.')
  const input = value as Record<string, unknown>
  const text = (key: string, limit: number, required = true) => {
    const value = input[key]
    if (
      typeof value !== 'string' ||
      value.length > limit ||
      (required && !value.trim())
    )
      throw new Error(`Check the ${key} field.`)
    const clean = value.trim()
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(clean))
      throw new Error(`Check the ${key} field.`)
    return clean
  }
  if (input.website) throw new Error('Unable to prepare this enquiry.')
  const tour = enquiryOptions.find(item => item.id === input.tour)
  if (!tour) throw new Error('Choose one of the listed activities.')
  const name = text('name', 100)
  const email = text('email', 254)
  if (!/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(email))
    throw new Error('Enter a valid email address.')
  const phone = text('phone', 40, false)
  if (phone && !/^[+\d\s().-]{5,40}$/.test(phone))
    throw new Error('Enter a valid phone number.')
  const date = text('date', 10, false)
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T12:00:00Z`)) ||
      new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date)
  )
    throw new Error('Enter a valid date.')
  if (!date && input.flexible !== true)
    throw new Error('Choose a preferred date or flexible dates.')
  if (
    !Number.isSafeInteger(input.groupSize) ||
    Number(input.groupSize) < 1 ||
    Number(input.groupSize) > 30
  )
    throw new Error(
      'Choose a group size between 1 and 30. Larger groups can contact the guide directly.'
    )
  if (!(tour.heli ? ['ski', 'snowboard', 'mixed'] : ['other']).includes(String(input.activity)))
    throw new Error('Choose skiing, snowboarding or a mixed group.')
  if (input.acknowledgement !== true)
    throw new Error(
      'Please acknowledge that this is an enquiry, subject to guide confirmation.'
    )
  const notes = text('notes', 1500, false)
  return {
    tour: tour.name,
    to: tour.to,
    heli: tour.heli,
    name,
    email,
    phone,
    date,
    flexible: input.flexible === true,
    groupSize: Number(input.groupSize),
    activity: String(input.activity),
    notes,
  }
}

export function prepareEnquiryDraft(value: unknown) {
  const enquiry = validateEnquiry(value)
  const body = [
    'Hello Swiss Alpine Guides,',
    '',
    `I would like to enquire about ${enquiry.tour}.`,
    `Preferred date: ${enquiry.date || 'Flexible'}`,
    `Flexible dates: ${enquiry.flexible ? 'Yes' : 'No'}`,
    `Group size: ${enquiry.groupSize}`,
    `Activity: ${enquiry.activity}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.phone ? `Phone: ${enquiry.phone}` : '',
    enquiry.notes ? `Notes: ${enquiry.notes}` : '',
    '',
    enquiry.heli ? 'I understand that weather, snow and avalanche conditions, guide and aircraft availability determine whether a trip can take place. This is an enquiry, not a confirmed booking.' : 'I understand that conditions, suitability, price and arrangements require operator confirmation. This is an enquiry, not a confirmed booking.',
  ]
    .filter((line) => line !== '')
    .join('\n')
  return { subject: `${enquiry.heli ? 'Heli-skiing' : 'Activity'} enquiry — ${enquiry.tour}`, body, to: enquiry.to }
}
