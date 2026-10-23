import Phaser from 'phaser'
import { prototypeFighters, type FighterDefinition, type FighterId } from '../data/fighters'
import { InputManager, type InputSnapshot, type PlayerId } from '../systems/InputManager'
import { attacks, clampToArena, resolveAttack, type AttackKind } from '../systems/CombatSystem'
import { chooseAIInput } from '../systems/FighterAI'
import { RoundManager, type RoundResult } from '../systems/RoundManager'

interface CombatSnapshot {
  health: [number, number]
  remainingSeconds: number
}

interface Actor {
  player: PlayerId
  definition: FighterDefinition
  x: number
  health: number
  facing: -1 | 1
  velocityX: number
  velocityY: number
  airborne: boolean
  blocking: boolean
  crouching: boolean
  attackCooldown: number
  specialCooldown: number
  attackTimer: number
  attackKind: AttackKind | null
  hitstun: number
  shieldTimer: number
  previous: InputSnapshot
  visual: Phaser.GameObjects.Container
  arm: Phaser.GameObjects.Rectangle
  shield: Phaser.GameObjects.Ellipse
}

const WIDTH = 960
const HEIGHT = 540
const FLOOR_Y = 444
const GRAVITY = 1500

function emptySnapshot(): InputSnapshot {
  return {
    left: false,
    right: false,
    jump: false,
    crouch: false,
    light: false,
    heavy: false,
    block: false,
    special: false,
  }
}

export class FightScene extends Phaser.Scene {
  private readonly playerFighterId: FighterId
  private readonly onSnapshot: (snapshot: CombatSnapshot) => void
  private readonly onRoundEnd: (result: RoundResult) => void
  private inputManager!: InputManager
  private player!: Actor
  private cpu!: Actor
  private round = new RoundManager()
  private countdown = 3
  private countdownText!: Phaser.GameObjects.Text
  private aiAttackDelay = 0.7
  private updateDelay = 0
  private notifiedResult = false

  constructor(
    playerFighterId: FighterId,
    onSnapshot: (snapshot: CombatSnapshot) => void,
    onRoundEnd: (result: RoundResult) => void,
  ) {
    super({ key: 'FightScene' })
    this.playerFighterId = playerFighterId
    this.onSnapshot = onSnapshot
    this.onRoundEnd = onRoundEnd
  }

  create() {
    this.drawArena()
    const selected = prototypeFighters.find((fighter) => fighter.id === this.playerFighterId)!
    const opponent = prototypeFighters.find((fighter) => fighter.id !== selected.id)!
    this.player = this.createActor(1, selected, 286, 1)
    this.cpu = this.createActor(2, opponent, 674, -1)
    this.inputManager = new InputManager(window)
    this.inputManager.enable()
    this.countdownText = this.add.text(WIDTH / 2, 205, 'READY', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '48px',
      color: '#f1c35c',
      stroke: '#171d1b',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(10)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this)
  }

  update(_time: number, deltaMs: number) {
    const delta = Math.min(deltaMs / 1000, 0.04)
    const elapsed = deltaMs / 1000
    this.countdown = Math.max(0, this.countdown - elapsed)
    if (this.countdown > 0) {
      this.countdownText.setText(this.countdown <= 1 ? 'FIGHT!' : Math.ceil(this.countdown).toString())
      this.updateActors()
      return
    }
    this.countdownText.setVisible(false)
    if (this.round.result) return

    const playerInput = this.inputManager.state.snapshot(1)
    const cpuInput = this.createAIInput(delta)
    this.faceEachOther()
    this.updateActor(this.player, playerInput, delta)
    this.updateActor(this.cpu, cpuInput, delta)
    this.updateActors()

    const result = this.round.tick(delta, [this.player.health, this.cpu.health])
    if (result && !this.notifiedResult) {
      this.notifiedResult = true
      this.inputManager.disable()
      this.onRoundEnd(result)
    }

    this.updateDelay += delta
    if (this.updateDelay >= 0.1) {
      this.updateDelay = 0
      this.onSnapshot({
        health: [this.player.health, this.cpu.health],
        remainingSeconds: this.round.remainingSeconds,
      })
    }
  }

  private createActor(player: PlayerId, definition: FighterDefinition, x: number, facing: -1 | 1): Actor {
    const visual = this.add.container(x, FLOOR_Y)
    const shadow = this.add.ellipse(0, -7, 76, 19, 0x101313, 0.55)
    const legs = this.add.rectangle(0, -34, 30, 36, 0x262a28)
    const sash = this.add.rectangle(-2, -57, 42, 9, definition.accentColor)
    const torso = this.add.rectangle(0, -77, 43, 39, definition.bodyColor)
    const chest = this.add.rectangle(0, -78, 9, 30, definition.accentColor)
    const head = this.add.rectangle(0, -111, 28, 27, 0xe5b58b)
    const hair = this.add.rectangle(-1, -123, 32, 8, 0x27211e)
    const arm = this.add.rectangle(25, -76, 25, 9, definition.bodyColor)
    const fist = this.add.rectangle(38, -77, 10, 12, definition.accentColor)
    const shield = this.add.ellipse(0, -80, 76, 94, definition.id === 'hulyo' ? 0x50d7d2 : 0xffe05e, 0.18)
    shield.setStrokeStyle(3, definition.id === 'hulyo' ? 0x7af5ee : 0xffe05e, 0.9)
    shield.setVisible(false)
    visual.add([shadow, legs, sash, torso, chest, head, hair, arm, fist, shield])
    visual.setScale(facing, 1)

    return {
      player,
      definition,
      x,
      health: 100,
      facing,
      velocityX: 0,
      velocityY: 0,
      airborne: false,
      blocking: false,
      crouching: false,
      attackCooldown: 0,
      specialCooldown: 0,
      attackTimer: 0,
      attackKind: null,
      hitstun: 0,
      shieldTimer: 0,
      previous: emptySnapshot(),
      visual,
      arm,
      shield,
    }
  }

  private drawArena() {
    const art = this.add.graphics()
    art.fillGradientStyle(0x202d2b, 0x202d2b, 0x111818, 0x111818, 1)
    art.fillRect(0, 0, WIDTH, HEIGHT)
    art.fillStyle(0x24302d, 1)
    art.fillRect(0, 230, WIDTH, 214)
    art.fillStyle(0x45504a, 1)
    art.fillRect(0, 322, WIDTH, 122)
    art.fillStyle(0x252b27, 1)
    art.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y)

    for (let index = 0; index < 12; index += 1) {
      const x = index * 92 - 12
      const buildingHeight = 65 + ((index * 37) % 88)
      art.fillStyle(index % 2 ? 0x36423d : 0x303a36, 1)
      art.fillRect(x, 322 - buildingHeight, 82, buildingHeight)
      art.fillStyle(index % 3 ? 0xc58e4f : 0x8c563e, 0.45)
      for (let row = 0; row < 3; row += 1) {
        art.fillRect(x + 14, 338 - buildingHeight + row * 22, 8, 12)
        art.fillRect(x + 53, 338 - buildingHeight + row * 22, 8, 12)
      }
    }

    art.fillStyle(0xf0c45b, 0.8)
    art.fillCircle(WIDTH / 2, 145, 32)
    art.fillStyle(0x202d2b, 1)
    art.fillCircle(WIDTH / 2, 145, 23)
    art.lineStyle(2, 0xf0c45b, 0.5)
    for (let x = -38; x <= 38; x += 19) art.lineBetween(WIDTH / 2 + x, 110, WIDTH / 2 + x, 179)

    for (let index = 0; index < 14; index += 1) {
      const x = 24 + index * 70
      art.fillStyle(index % 2 ? 0xd74d46 : 0xf1c35c, 0.9)
      art.fillTriangle(x, 12, x + 23, 12, x + 12, 33)
    }
    art.fillStyle(0x687168, 0.9)
    art.fillRect(0, FLOOR_Y, WIDTH, 4)
    art.lineStyle(1, 0x535b50, 0.5)
    for (let x = 0; x <= WIDTH; x += 80) art.lineBetween(x, FLOOR_Y + 4, x - 28, HEIGHT)
    for (let y = FLOOR_Y + 35; y < HEIGHT; y += 35) art.lineBetween(0, y, WIDTH, y)
    art.fillStyle(0xe8bd58, 0.11)
    art.fillRect(0, FLOOR_Y - 24, WIDTH, 24)
  }

  private createAIInput(delta: number): InputSnapshot {
    const distance = Math.abs(this.cpu.x - this.player.x)
    this.aiAttackDelay -= delta
    const roll = Math.random()
    const input = chooseAIInput({
      distance,
      facing: this.cpu.facing,
      attackReady: this.aiAttackDelay <= 0,
      specialReady: this.cpu.specialCooldown <= 0,
      health: this.cpu.health,
      opponentAttacking: this.player.attackTimer > 0,
      roll,
    })
    if (input.light || input.heavy || input.special) this.aiAttackDelay = 0.9 + roll * 0.7
    return input
  }

  private updateActor(actor: Actor, input: InputSnapshot, delta: number) {
    actor.attackCooldown = Math.max(0, actor.attackCooldown - delta * 1000)
    actor.specialCooldown = Math.max(0, actor.specialCooldown - delta * 1000)
    actor.hitstun = Math.max(0, actor.hitstun - delta * 1000)
    actor.attackTimer = Math.max(0, actor.attackTimer - delta * 1000)
    actor.shieldTimer = Math.max(0, actor.shieldTimer - delta * 1000)
    actor.blocking = input.block || (actor.definition.id === 'hulyo' && actor.shieldTimer > 0)
    actor.crouching = input.crouch && !actor.airborne

    const movement = Number(input.right) - Number(input.left)
    if (actor.hitstun <= 0 && actor.attackTimer <= 0 && !actor.blocking) {
      actor.velocityX = movement * actor.definition.speed
    } else {
      actor.velocityX *= 0.78
    }
    actor.x += actor.velocityX * delta
    actor.velocityX *= Math.pow(0.0008, delta)
    actor.x = clampToArena(actor.x, 44, WIDTH)

    if (input.jump && !actor.previous.jump && !actor.airborne && actor.hitstun <= 0) {
      actor.velocityY = -590
      actor.airborne = true
    }
    if (actor.airborne) {
      actor.velocityY += GRAVITY * delta
      actor.visual.y += actor.velocityY * delta
      if (actor.visual.y >= FLOOR_Y) {
        actor.visual.y = FLOOR_Y
        actor.velocityY = 0
        actor.airborne = false
      }
    }

    if (actor.hitstun <= 0) {
      if (input.light && !actor.previous.light) this.startAttack(actor, 'light')
      if (input.heavy && !actor.previous.heavy) this.startAttack(actor, 'heavy')
      if (input.special && !actor.previous.special) this.useSpecial(actor)
    }

    actor.previous = { ...input }
    actor.arm.x = actor.attackTimer > 0 ? 37 : 25
    actor.arm.width = actor.attackTimer > 0 ? 45 : 25
    actor.shield.setVisible(actor.shieldTimer > 0)
    actor.visual.setAlpha(actor.hitstun > 0 && Math.floor(actor.hitstun / 90) % 2 === 0 ? 0.55 : 1)
  }

  private startAttack(actor: Actor, kind: AttackKind) {
    if (actor.attackCooldown > 0 || actor.blocking || actor.airborne) return
    actor.attackKind = kind
    actor.attackTimer = kind === 'light' ? 230 : 340
    actor.attackCooldown = attacks[kind].cooldownMs
    const defender = actor.player === 1 ? this.cpu : this.player
    this.resolveStrike(actor, defender, attacks[kind])
  }

  private useSpecial(actor: Actor) {
    if (actor.specialCooldown > 0 || actor.blocking || actor.airborne) return
    actor.specialCooldown = 1700
    if (actor.definition.id === 'hunyo') {
      actor.x = clampToArena(actor.x + actor.facing * 90, 44, WIDTH)
      actor.attackTimer = 380
      actor.attackKind = 'special'
      this.resolveStrike(actor, actor.player === 1 ? this.cpu : this.player, attacks.special)
      return
    }
    actor.shieldTimer = 950
    actor.blocking = true
  }

  private resolveStrike(actor: Actor, defender: Actor, attack: typeof attacks[AttackKind]) {
    if (defender.definition.id === 'hulyo' && defender.shieldTimer > 0) {
      actor.health = Math.max(0, actor.health - 11)
      actor.hitstun = 240
      actor.velocityX = -actor.facing * 200
      return
    }
    const hit = resolveAttack(actor, defender, attack)
    if (!hit.hit) return
    defender.health = Math.max(0, defender.health - hit.damage)
    if (hit.knockback !== 0) {
      defender.velocityX = hit.knockback * 4
      defender.hitstun = 220
    }
  }

  private faceEachOther() {
    this.player.facing = this.player.x <= this.cpu.x ? 1 : -1
    this.cpu.facing = this.cpu.x <= this.player.x ? 1 : -1
    this.player.visual.setScale(this.player.facing, 1)
    this.cpu.visual.setScale(this.cpu.facing, 1)
  }

  private updateActors() {
    this.player.visual.x = this.player.x
    this.cpu.visual.x = this.cpu.x
    this.player.visual.setDepth(Math.round(this.player.x))
    this.cpu.visual.setDepth(Math.round(this.cpu.x))
  }

  private onShutdown() {
    this.inputManager?.destroy()
  }
}