import { describe, expect, it } from 'vitest'
import { chooseAIInput } from './FighterAI'

const base = {
  distance: 200,
  facing: -1 as const,
  attackReady: false,
  specialReady: false,
  health: 100,
  opponentAttacking: false,
  roll: 0.8,
}

describe('FighterAI', () => {
  it('approaches when outside fighting range', () => {
    expect(chooseAIInput(base).left).toBe(true)
  })

  it('blocks an incoming attack when its defense roll succeeds', () => {
    expect(chooseAIInput({ ...base, distance: 90, opponentAttacking: true }).block).toBe(true)
  })

  it('uses a special move at low health when ready', () => {
    expect(chooseAIInput({
      ...base,
      distance: 100,
      attackReady: true,
      specialReady: true,
      health: 30,
    }).special).toBe(true)
  })
})