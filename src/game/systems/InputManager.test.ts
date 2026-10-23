import { describe, expect, it } from 'vitest'
import { InputState } from './InputManager'

describe('InputState', () => {
  it('keeps simultaneous movement and attack inputs held', () => {
    const input = new InputState()
    input.press('KeyD')
    input.press('KeyJ')

    expect(input.snapshot(1)).toMatchObject({ right: true, light: true })
    expect(input.snapshot(2)).toMatchObject({ right: false, light: false })
  })

  it('routes the second player profile independently', () => {
    const input = new InputState()
    input.press('ArrowLeft')
    input.press('KeyX')

    expect(input.snapshot(2)).toMatchObject({ left: true, heavy: true })
    expect(input.snapshot(1)).toMatchObject({ left: false, heavy: false })
  })

  it('clears held inputs on interruption', () => {
    const input = new InputState()
    input.press('KeyW')
    input.press('KeyK')
    input.clear()

    expect(Object.values(input.snapshot(1)).every((held) => !held)).toBe(true)
  })
})