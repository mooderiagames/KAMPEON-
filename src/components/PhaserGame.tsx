import { useEffect, useRef } from 'react'
import type { FighterId } from '../game/data/fighters'
import type { RoundResult } from '../game/systems/RoundManager'

interface CombatSnapshot {
  health: [number, number]
  remainingSeconds: number
}

interface PhaserGameProps {
  playerFighterId: FighterId
  onSnapshot: (snapshot: CombatSnapshot) => void
  onRoundEnd: (result: RoundResult) => void
}

export function PhaserGame({ playerFighterId, onSnapshot, onRoundEnd }: PhaserGameProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hostRef.current) return

    let game: import('phaser').Game | undefined
    let cancelled = false
    void Promise.all([
      import('phaser'),
      import('../game/scenes/FightScene'),
    ]).then(([{ default: Phaser }, { FightScene }]) => {
      if (cancelled || !hostRef.current) return
      const scene = new FightScene(playerFighterId, onSnapshot, onRoundEnd)
      game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent: hostRef.current,
        width: 960,
        height: 540,
        backgroundColor: '#18201f',
        pixelArt: true,
        roundPixels: true,
        antialias: false,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 960,
          height: 540,
        },
        scene,
      })
    })

    return () => {
      cancelled = true
      game?.destroy(true)
    }
  }, [onRoundEnd, onSnapshot, playerFighterId])

  return <div className="phaser-host" ref={hostRef} aria-label="Fighting game arena" />
}