import type { Restaurant } from '../types'

export const MAP_CENTER = { lat: 42.4420, lng: -76.4848 } // Collegetown, Ithaca
export const MAP_ZOOM = 15

export const FOOD_PREF_OPTIONS = [
  'ramen', 'indian', 'korean', 'japanese', 'sushi', 'thai', 'vietnamese',
  'chinese', 'mexican', 'mediterranean', 'italian', 'american', 'bbq',
  'vegetarian', 'vegan', 'gluten-free', 'halal', 'bagels', 'pizza',
  'seafood', 'boba', 'coffee', 'late-night', 'cheap eats',
]

export const VIBE_TAG_OPTIONS = [
  'chill', 'loud', 'post-class', 'study-after', 'first-dates ok',
  'friend group', 'quiet', 'adventurous', 'foodies only', 'no phones',
]

export const EMOJI_OPTIONS = [
  '🌶️','🌿','🎧','📚','🌙','🦊','🍓','🐝','🌊','🎨',
  '🎵','🌸','⚡','🍜','🫐','🌻','🐉','🪐','🎲','🦋',
]

export const TONE_OPTIONS = [
  '#FCEAE3','#EAE3F4','#E6F0E2','#FDE6E6','#F4ECDA',
  '#E2EBF1','#F0E6F4','#E6F4EC','#F4E6DA','#E6E6F4',
]

// Warm, minimal map style matching the paper/ink aesthetic
export const MAP_STYLE = [
  { featureType: 'all', stylers: [{ saturation: -25 }] },
  { featureType: 'landscape', stylers: [{ color: '#f5ede0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8ddd0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ddd0c0' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a655b' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#fbf5ec' }] },
  { featureType: 'water', stylers: [{ color: '#c8dde8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dde8cc' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#7a655b' }] },
  { featureType: 'administrative', elementType: 'labels.text.stroke', stylers: [{ color: '#fbf5ec' }] },
]

// Hardcoded Ithaca / Cornell-area restaurants — zero API calls for demo
export const RESTAURANTS: Restaurant[] = [
  { id: 'r1',  name: 'Mehak Indian Cuisine',   address: '306 College Ave',    lat: 42.4421, lng: -76.4848, cuisines: ['indian','vegetarian'], price: '$$' },
  { id: 'r2',  name: 'Koko Korean BBQ',         address: '316 College Ave',    lat: 42.4419, lng: -76.4843, cuisines: ['korean','bbq'],        price: '$$$' },
  { id: 'r3',  name: 'Collegetown Bagels',       address: '415 College Ave',    lat: 42.4430, lng: -76.4860, cuisines: ['bagels','cheap eats'], price: '$' },
  { id: 'r4',  name: 'Saigon Kitchen',           address: '203 N Aurora St',    lat: 42.4397, lng: -76.4967, cuisines: ['vietnamese','asian'],  price: '$$' },
  { id: 'r5',  name: 'Luna Inspired Street Food',address: '112 N Aurora St',    lat: 42.4401, lng: -76.4972, cuisines: ['mexican','fusion'],    price: '$$' },
  { id: 'r6',  name: 'Taste of Thai Express',    address: '312 College Ave',    lat: 42.4420, lng: -76.4851, cuisines: ['thai','asian'],        price: '$' },
  { id: 'r7',  name: 'The Nines',               address: '311 College Ave',    lat: 42.4422, lng: -76.4848, cuisines: ['american','late-night'],price: '$$' },
  { id: 'r8',  name: 'Just a Taste',            address: '116 N Aurora St',    lat: 42.4400, lng: -76.4969, cuisines: ['mediterranean','chill'],price: '$$$' },
  { id: 'r9',  name: 'Plum Tree Japanese',      address: '106 N Aurora St',    lat: 42.4399, lng: -76.4971, cuisines: ['japanese','sushi','ramen'], price: '$$' },
  { id: 'r10', name: 'Agava Restaurant',         address: '118 E State St',     lat: 42.4399, lng: -76.4966, cuisines: ['mexican'],             price: '$$' },
  { id: 'r11', name: 'Shortstop Deli',           address: '400 College Ave',    lat: 42.4433, lng: -76.4862, cuisines: ['bagels','sandwiches','cheap eats'], price: '$' },
  { id: 'r12', name: 'Viva Taqueria',            address: '310 College Ave',    lat: 42.4418, lng: -76.4849, cuisines: ['mexican','cheap eats'], price: '$' },
  { id: 'r13', name: 'Pho & Beyond',             address: '130 E State St',     lat: 42.4396, lng: -76.4964, cuisines: ['vietnamese','ramen'],  price: '$' },
  { id: 'r14', name: 'Hai Hong',                 address: '201 S Cayuga St',    lat: 42.4393, lng: -76.4962, cuisines: ['chinese','dim sum'],   price: '$$' },
  { id: 'r15', name: 'Ithaca Ale House',         address: '112 N Aurora St',    lat: 42.4402, lng: -76.4970, cuisines: ['american','late-night'], price: '$$' },
]
