import type { InputSnapshot } from './InputManager'

export interface FighterAIContext {
  distance: number
  facing: -1 | 1
  attackReady: boolean
  specialReady: boolean
  health: number
  opponentAttacking: boolean
  roll: number
}

export function chooseAIInput(context: FighterAIContext): InputSnapshot {
  const input: InputSnapshot = {
    left: false,
    right: false,
    jump: false,
    crouch: false,
    light: false,
    heavy: false,
    block: false,
    special: false,
  }

  if (context.distance > 128) {
    input.left = context.facing === -1
    input.right = context.facing === 1
  } else if (context.distance < 76) {
    input.left = context.facing === 1
    input.right = context.facing === -1
  }

  input.block = context.opponentAttacking && context.roll > 0.45
  if (context.distance < 124 && context.attackReady) {
    input[context.health < 45 && context.specialReady
      ? 'special'
      : context.roll > 0.55 ? 'heavy' : 'light'] = true
  }

  return input
}