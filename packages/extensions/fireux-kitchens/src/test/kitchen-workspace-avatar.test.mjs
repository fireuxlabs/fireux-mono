import assert from 'node:assert/strict'
import test from 'node:test'
import { kitchenWorkspaceAvatar } from '../runtime/kitchen/utils/kitchen-workspace-avatar.ts'

const venue = {
  id: 'venue',
  display_name: 'Venue',
  display_image_url: '/profile.png',
  logo_image: '/logo.png',
  media_backdrop_color: '#ffffff',
}

test('Workspace identity uses the saved logo and its backdrop rather than the profile image', () => {
  const avatar = kitchenWorkspaceAvatar(venue)
  assert.equal(avatar.src, venue.logo_image)
  assert.equal(avatar.alt, venue.display_name)
  assert.equal(avatar.style.backgroundColor, '#ffffff')
  assert.match(avatar.ui.image, /object-contain/)
})

test('A profile-photo fallback receives no brand backdrop or logo fitting', () => {
  const avatar = kitchenWorkspaceAvatar({ ...venue, logo_image: '' })
  assert.equal(avatar.src, venue.display_image_url)
  assert.equal(avatar.style, undefined)
  assert.equal(avatar.ui, undefined)
})

test('Changing Kitchen uses that Kitchen’s media and clears a previous logo backdrop', () => {
  kitchenWorkspaceAvatar(venue)
  const next = kitchenWorkspaceAvatar({
    id: 'other',
    display_image_url: '/other.jpg',
  })
  assert.equal(next.src, '/other.jpg')
  assert.equal(next.alt, 'other')
  assert.equal(next.style, undefined)
  assert.equal(next.ui, undefined)
  const empty = kitchenWorkspaceAvatar(null)
  assert.equal(empty.src, undefined)
  assert.equal(empty.style, undefined)
  assert.equal(empty.icon, 'i-lucide-chef-hat')
})
