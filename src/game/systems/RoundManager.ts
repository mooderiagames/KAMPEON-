export type RoundWinner = 1 | 2 | 'draw'

export interface RoundResult {
  winner: RoundWinner
  reason: 'knockout' | 'time'
}

export class RoundManager {
  readonly durationSeconds = 99
  remainingSeconds = this.durationSeconds
  result: RoundResult | null = null

  tick(deltaSeconds: number, health: [number, number]) {
    if (this.result) return this.result
    this.remainingSeconds = Math.max(0, this.remainingSeconds - deltaSeconds)

    if (health[0] <= 0 || health[1] <= 0) {
      const winner = health[0] <= 0 && health[1] <= 0 ? 'draw' : health[0] <= 0 ? 2 : 1
      return this.finish(winner, 'knockout')
    }

    if (this.remainingSeconds === 0) {
      const winner = health[0] === health[1] ? 'draw' : health[0] > health[1] ? 1 : 2
      return this.finish(winner, 'time')
    }

    return null
  }

  reset() {
    this.remainingSeconds = this.durationSeconds
    this.result = null
  }

  private finish(winner: RoundWinner, reason: RoundResult['reason']) {
    if (!this.result) this.result = { winner, reason }
    return this.result
  }
}