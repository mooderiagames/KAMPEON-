export type FighterId = 'hunyo' | 'hulyo'

export interface FighterDefinition {
  id: FighterId
  name: string
  element: string
  style: string
  color: string
  accent: string
  bodyColor: number
  accentColor: number
  speed: number
}

export const prototypeFighters: FighterDefinition[] = [
  {
    id: 'hunyo',
    name: 'HUNYO',
    element: 'LIGHTNING',
    style: 'Rapid elemental striker',
    color: '#d85043',
    accent: '#f3bc49',
    bodyColor: 0x9c2e37,
    accentColor: 0xf2bd53,
    speed: 285,
  },
  {
    id: 'hulyo',
    name: 'HULYO',
    element: 'WATER',
    style: 'Fluid defensive counter',
    color: '#3e8f9a',
    accent: '#e9ca7b',
    bodyColor: 0x247381,
    accentColor: 0xe8ce85,
    speed: 240,
  },
]