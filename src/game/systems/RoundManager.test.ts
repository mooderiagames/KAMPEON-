import { describe, expect, it } from 'vitest'
import { RoundManager } from './RoundManager'

describe('RoundManager', () => {
  it('resolves a knockout only once', () => {
    const round = new RoundManager()
    const result = round.tick(0.016, [0, 35])

    expect(result).toEqual({ winner: 2, reason: 'knockout' })
    expect(round.tick(1, [0, 0])).toBe(result)
  })

  it('uses remaining health to decide a timed round and resets cleanly', () => {
    const round = new RoundManager()
    expect(round.tick(99, [62, 41])).toEqual({ winner: 1, reason: 'time' })
    round.reset()
    expect(round.remainingSeconds).toBe(99)
    expect(round.result).toBeNull()
  })
})