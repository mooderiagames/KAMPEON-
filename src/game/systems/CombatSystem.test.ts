import { describe, expect, it } from 'vitest'
import { attacks, clampToArena, resolveAttack } from './CombatSystem'

const attacker = { x: 100, facing: 1 as const, health: 100, blocking: false }

describe('combat resolution', () => {
  it('deals damage inside the forward hit range', () => {
    const result = resolveAttack(attacker, {
      x: 170,
      facing: -1,
      health: 100,
      blocking: false,
    }, attacks.light)

    expect(result).toEqual({ hit: true, damage: 7, knockback: 18 })
  })

  it('does not hit outside range or behind the attacker', () => {
    expect(resolveAttack(attacker, {
      x: 220,
      facing: -1,
      health: 100,
      blocking: false,
    }, attacks.light).hit).toBe(false)

    expect(resolveAttack(attacker, {
      x: 50,
      facing: 1,
      health: 100,
      blocking: false,
    }, attacks.heavy).hit).toBe(false)
  })

  it('reduces damage and removes knockback when the defender blocks', () => {
    const result = resolveAttack(attacker, {
      x: 160,
      facing: -1,
      health: 100,
      blocking: true,
    }, attacks.heavy)

    expect(result).toEqual({ hit: true, damage: 2, knockback: 0 })
  })

  it('keeps fighters within arena boundaries', () => {
    expect(clampToArena(-10, 30, 800)).toBe(30)
    expect(clampToArena(900, 30, 800)).toBe(770)
  })
})