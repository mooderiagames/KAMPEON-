interface CombatHUDProps {
  health: [number, number]
  remainingSeconds: number
  playerName: string
  opponentName: string
}

export function CombatHUD({ health, remainingSeconds, playerName, opponentName }: CombatHUDProps) {
  return (
    <div className="combat-hud" aria-label="Match status">
      <div className="health-unit player-health">
        <div className="health-label"><span>PLAYER 1</span><strong>{playerName}</strong></div>
        <div className="health-track" role="meter" aria-label={`${playerName} health`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={health[0]}>
          <span className="health-fill" style={{ width: `${health[0]}%` }} />
        </div>
      </div>
      <div className="timer-block"><span>ROUND 01</span><strong>{Math.ceil(remainingSeconds).toString().padStart(2, '0')}</strong></div>
      <div className="health-unit opponent-health">
        <div className="health-label"><strong>{opponentName}</strong><span>CPU</span></div>
        <div className="health-track" role="meter" aria-label={`${opponentName} health`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={health[1]}>
          <span className="health-fill" style={{ width: `${health[1]}%` }} />
        </div>
      </div>
    </div>
  )
}