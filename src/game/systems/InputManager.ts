export type GameplayAction =
  | 'left'
  | 'right'
  | 'jump'
  | 'crouch'
  | 'light'
  | 'heavy'
  | 'block'
  | 'special'

export type PlayerId = 1 | 2
export type InputSnapshot = Record<GameplayAction, boolean>

const bindings: Record<PlayerId, Partial<Record<string, GameplayAction>>> = {
  1: {
    KeyA: 'left',
    KeyD: 'right',
    KeyW: 'jump',
    KeyS: 'crouch',
    KeyJ: 'light',
    KeyK: 'heavy',
    KeyL: 'block',
    KeyU: 'special',
  },
  2: {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'jump',
    ArrowDown: 'crouch',
    KeyZ: 'light',
    KeyX: 'heavy',
    KeyC: 'block',
    KeyV: 'special',
  },
}

const allActions: GameplayAction[] = [
  'left',
  'right',
  'jump',
  'crouch',
  'light',
  'heavy',
  'block',
  'special',
]

export class InputState {
  private readonly heldCodes = new Set<string>()

  press(code: string) {
    this.heldCodes.add(code)
  }

  release(code: string) {
    this.heldCodes.delete(code)
  }

  clear() {
    this.heldCodes.clear()
  }

  snapshot(player: PlayerId): InputSnapshot {
    const profile = bindings[player]
    return Object.fromEntries(
      allActions.map((action) => [
        action,
        [...this.heldCodes].some((code) => profile[code] === action),
      ]),
    ) as InputSnapshot
  }

  owns(code: string) {
    return code in bindings[1] || code in bindings[2]
  }
}

export class InputManager {
  readonly state = new InputState()
  private enabled = false
  private readonly target: Window

  constructor(target: Window) {
    this.target = target
    target.addEventListener('keydown', this.onKeyDown)
    target.addEventListener('keyup', this.onKeyUp)
    target.addEventListener('blur', this.clear)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
    this.state.clear()
  }

  destroy() {
    this.disable()
    this.target.removeEventListener('keydown', this.onKeyDown)
    this.target.removeEventListener('keyup', this.onKeyUp)
    this.target.removeEventListener('blur', this.clear)
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.enabled || !this.state.owns(event.code)) return
    event.preventDefault()
    this.state.press(event.code)
  }

  private readonly onKeyUp = (event: KeyboardEvent) => {
    if (this.state.owns(event.code)) this.state.release(event.code)
  }

  private readonly clear = () => this.state.clear()
}