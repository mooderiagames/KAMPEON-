export type AttackKind = 'light' | 'heavy' | 'special'

export interface AttackProfile {
  kind: AttackKind
  damage: number
  range: number
  knockback: number
  cooldownMs: number
}

export interface FighterCombatState {
  x: number
  facing: -1 | 1
  health: number
  blocking: boolean
}

export interface HitResult {
  hit: boolean
  damage: number
  knockback: number
}

export const attacks: Record<AttackKind, AttackProfile> = {
  light: { kind: 'light', damage: 7, range: 90, knockback: 18, cooldownMs: 360 },
  heavy: { kind: 'heavy', damage: 13, range: 118, knockback: 34, cooldownMs: 720 },
  special: { kind: 'special', damage: 19, range: 180, knockback: 48, cooldownMs: 1500 },
}

export function resolveAttack(
  attacker: FighterCombatState,
  defender: FighterCombatState,
  attack: AttackProfile,
): HitResult {
  const distance = Math.abs(defender.x - attacker.x)
  const isInFront = Math.sign(defender.x - attacker.x) === attacker.facing

  if (!isInFront || distance > attack.range || defender.health <= 0) {
    return { hit: false, damage: 0, knockback: 0 }
  }

  const blocked = defender.blocking && defender.facing === -attacker.facing
  const damage = blocked ? Math.max(1, Math.floor(attack.damage * 0.2)) : attack.damage
  return {
    hit: true,
    damage,
    knockback: blocked ? 0 : attack.knockback * attacker.facing,
  }
}

export function clampToArena(x: number, radius: number, width: number) {
  return Math.min(width - radius, Math.max(radius, x))
}