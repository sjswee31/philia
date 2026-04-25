export type SkinToneId = 'porcelain' | 'warm' | 'golden' | 'amber' | 'deep'
export type FaceShapeId = 'soft' | 'oval' | 'round' | 'square'
export type EyesId = 'dot' | 'smile' | 'almond' | 'spark' | 'wink'
export type BrowsId = 'soft' | 'straight' | 'arched' | 'bold'
export type NoseId = 'button' | 'bridge' | 'round' | 'long'
export type MouthId = 'smile' | 'soft' | 'grin' | 'open'
export type HairId = 'buzz' | 'bob' | 'sidePart' | 'curly' | 'waves' | 'locs'
export type EyewearId = 'none' | 'round' | 'square' | 'tint'
export type HatId = 'none' | 'beanie' | 'cap' | 'headband' | 'kerchief'
export type AccessoryId = 'none' | 'earring' | 'starClip' | 'sparkles' | 'freckles'

export interface AvatarFaceConfig {
  skinTone: SkinToneId
  faceShape: FaceShapeId
  eyes: EyesId
  brows: BrowsId
  nose: NoseId
  mouth: MouthId
  hair: HairId
  eyewear: EyewearId
  hat: HatId
  accessory: AccessoryId
}

export type AvatarFaceInput = AvatarFaceConfig | string | undefined

export interface FaceOption<T extends string> {
  id: T
  label: string
}

export interface FaceEditorCategory {
  id: keyof AvatarFaceConfig
  label: string
}

export const SKIN_TONE_OPTIONS: FaceOption<SkinToneId>[] = [
  { id: 'porcelain', label: 'Porcelain' },
  { id: 'warm', label: 'Warm' },
  { id: 'golden', label: 'Golden' },
  { id: 'amber', label: 'Amber' },
  { id: 'deep', label: 'Deep' },
]

export const FACE_SHAPE_OPTIONS: FaceOption<FaceShapeId>[] = [
  { id: 'soft', label: 'Soft' },
  { id: 'oval', label: 'Oval' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
]

export const EYE_OPTIONS: FaceOption<EyesId>[] = [
  { id: 'dot', label: 'Dot' },
  { id: 'smile', label: 'Smile' },
  { id: 'almond', label: 'Almond' },
  { id: 'spark', label: 'Spark' },
  { id: 'wink', label: 'Wink' },
]

export const BROW_OPTIONS: FaceOption<BrowsId>[] = [
  { id: 'soft', label: 'Soft' },
  { id: 'straight', label: 'Straight' },
  { id: 'arched', label: 'Arched' },
  { id: 'bold', label: 'Bold' },
]

export const NOSE_OPTIONS: FaceOption<NoseId>[] = [
  { id: 'button', label: 'Button' },
  { id: 'bridge', label: 'Bridge' },
  { id: 'round', label: 'Round' },
  { id: 'long', label: 'Long' },
]

export const MOUTH_OPTIONS: FaceOption<MouthId>[] = [
  { id: 'smile', label: 'Smile' },
  { id: 'soft', label: 'Soft' },
  { id: 'grin', label: 'Grin' },
  { id: 'open', label: 'Open' },
]

export const HAIR_OPTIONS: FaceOption<HairId>[] = [
  { id: 'buzz', label: 'Buzz' },
  { id: 'bob', label: 'Bob' },
  { id: 'sidePart', label: 'Side Part' },
  { id: 'curly', label: 'Curly' },
  { id: 'waves', label: 'Waves' },
  { id: 'locs', label: 'Locs' },
]

export const EYEWEAR_OPTIONS: FaceOption<EyewearId>[] = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'tint', label: 'Tint' },
]

export const HAT_OPTIONS: FaceOption<HatId>[] = [
  { id: 'none', label: 'None' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'cap', label: 'Cap' },
  { id: 'headband', label: 'Headband' },
  { id: 'kerchief', label: 'Kerchief' },
]

export const ACCESSORY_OPTIONS: FaceOption<AccessoryId>[] = [
  { id: 'none', label: 'None' },
  { id: 'earring', label: 'Earring' },
  { id: 'starClip', label: 'Star Clip' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'freckles', label: 'Freckles' },
]

export const FACE_EDITOR_CATEGORIES: FaceEditorCategory[] = [
  { id: 'skinTone', label: 'Tone' },
  { id: 'faceShape', label: 'Face' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'brows', label: 'Brows' },
  { id: 'nose', label: 'Nose' },
  { id: 'mouth', label: 'Mouth' },
  { id: 'hair', label: 'Hair' },
  { id: 'eyewear', label: 'Glasses' },
  { id: 'hat', label: 'Hat' },
  { id: 'accessory', label: 'Extra' },
]

export const FACE_OPTION_GROUPS = {
  skinTone: SKIN_TONE_OPTIONS,
  faceShape: FACE_SHAPE_OPTIONS,
  eyes: EYE_OPTIONS,
  brows: BROW_OPTIONS,
  nose: NOSE_OPTIONS,
  mouth: MOUTH_OPTIONS,
  hair: HAIR_OPTIONS,
  eyewear: EYEWEAR_OPTIONS,
  hat: HAT_OPTIONS,
  accessory: ACCESSORY_OPTIONS,
} satisfies { [K in keyof AvatarFaceConfig]: FaceOption<AvatarFaceConfig[K]>[] }

export const DEFAULT_FACE: AvatarFaceConfig = {
  skinTone: 'warm',
  faceShape: 'soft',
  eyes: 'almond',
  brows: 'soft',
  nose: 'button',
  mouth: 'smile',
  hair: 'sidePart',
  eyewear: 'none',
  hat: 'none',
  accessory: 'none',
}

const LEGACY_FACE_PRESETS: Record<string, AvatarFaceConfig> = {
  ash: { skinTone: 'porcelain', faceShape: 'oval', eyes: 'dot', brows: 'straight', nose: 'button', mouth: 'soft', hair: 'buzz', eyewear: 'none', hat: 'none', accessory: 'freckles' },
  birch: { skinTone: 'warm', faceShape: 'soft', eyes: 'smile', brows: 'soft', nose: 'bridge', mouth: 'smile', hair: 'bob', eyewear: 'round', hat: 'none', accessory: 'earring' },
  cedar: { skinTone: 'golden', faceShape: 'square', eyes: 'almond', brows: 'bold', nose: 'long', mouth: 'grin', hair: 'locs', eyewear: 'none', hat: 'beanie', accessory: 'none' },
  dune: { skinTone: 'amber', faceShape: 'round', eyes: 'spark', brows: 'arched', nose: 'round', mouth: 'open', hair: 'waves', eyewear: 'tint', hat: 'none', accessory: 'sparkles' },
  flint: { skinTone: 'deep', faceShape: 'oval', eyes: 'wink', brows: 'straight', nose: 'bridge', mouth: 'smile', hair: 'buzz', eyewear: 'square', hat: 'cap', accessory: 'none' },
  glen: { skinTone: 'warm', faceShape: 'soft', eyes: 'almond', brows: 'arched', nose: 'button', mouth: 'soft', hair: 'curly', eyewear: 'none', hat: 'headband', accessory: 'starClip' },
  harbor: { skinTone: 'golden', faceShape: 'square', eyes: 'smile', brows: 'bold', nose: 'long', mouth: 'grin', hair: 'sidePart', eyewear: 'square', hat: 'none', accessory: 'earring' },
  iris: { skinTone: 'porcelain', faceShape: 'round', eyes: 'spark', brows: 'soft', nose: 'round', mouth: 'open', hair: 'bob', eyewear: 'round', hat: 'kerchief', accessory: 'starClip' },
  juniper: { skinTone: 'amber', faceShape: 'soft', eyes: 'dot', brows: 'arched', nose: 'bridge', mouth: 'smile', hair: 'waves', eyewear: 'none', hat: 'beanie', accessory: 'sparkles' },
  kestrel: { skinTone: 'deep', faceShape: 'square', eyes: 'almond', brows: 'bold', nose: 'long', mouth: 'soft', hair: 'locs', eyewear: 'tint', hat: 'none', accessory: 'freckles' },
  lumen: { skinTone: 'warm', faceShape: 'oval', eyes: 'wink', brows: 'straight', nose: 'button', mouth: 'open', hair: 'curly', eyewear: 'round', hat: 'cap', accessory: 'earring' },
  marsh: { skinTone: 'golden', faceShape: 'round', eyes: 'smile', brows: 'soft', nose: 'round', mouth: 'grin', hair: 'waves', eyewear: 'none', hat: 'headband', accessory: 'freckles' },
}

export const FACE_PRESETS = Object.entries(LEGACY_FACE_PRESETS).map(([id, face]) => ({ id, face }))

export const FACE_OPTIONS = FACE_PRESETS.map((preset) => preset.face)

export function normalizeFace(input?: AvatarFaceInput): AvatarFaceConfig {
  if (!input) return { ...DEFAULT_FACE }
  if (typeof input === 'string') return { ...(LEGACY_FACE_PRESETS[input] ?? DEFAULT_FACE) }
  return {
    skinTone: input.skinTone ?? DEFAULT_FACE.skinTone,
    faceShape: input.faceShape ?? DEFAULT_FACE.faceShape,
    eyes: input.eyes ?? DEFAULT_FACE.eyes,
    brows: input.brows ?? DEFAULT_FACE.brows,
    nose: input.nose ?? DEFAULT_FACE.nose,
    mouth: input.mouth ?? DEFAULT_FACE.mouth,
    hair: input.hair ?? DEFAULT_FACE.hair,
    eyewear: input.eyewear ?? DEFAULT_FACE.eyewear,
    hat: input.hat ?? DEFAULT_FACE.hat,
    accessory: input.accessory ?? DEFAULT_FACE.accessory,
  }
}

export function updateFace<K extends keyof AvatarFaceConfig>(
  face: AvatarFaceInput,
  category: K,
  value: AvatarFaceConfig[K],
): AvatarFaceConfig {
  return {
    ...normalizeFace(face),
    [category]: value,
  }
}

export function randomFace(seed?: number): AvatarFaceConfig {
  const index = typeof seed === 'number' ? Math.abs(seed) % FACE_PRESETS.length : Math.floor(Math.random() * FACE_PRESETS.length)
  return { ...FACE_PRESETS[index].face }
}
