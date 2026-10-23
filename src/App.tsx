import { useState } from 'react'
import './App.css'
import { CombatHUD } from './components/CombatHUD'
import { PhaserGame } from './components/PhaserGame'
import { prototypeFighters, type FighterId } from './game/data/fighters'
import type { RoundResult } from './game/systems/RoundManager'

interface CombatSnapshot {
  health: [number, number]
  remainingSeconds: number
}

function App() {
  const [fighterId, setFighterId] = useState<FighterId>('hunyo')
  const [playing, setPlaying] = useState(false)
  const [result, setResult] = useState<RoundResult | null>(null)
  const [snapshot, setSnapshot] = useState<CombatSnapshot>({
    health: [100, 100],
    remainingSeconds: 99,
  })
  const [matchKey, setMatchKey] = useState(0)
  const opponent = prototypeFighters.find((fighter) => fighter.id !== fighterId)!

  const startMatch = () => {
    setResult(null)
    setSnapshot({ health: [100, 100], remainingSeconds: 99 })
    setPlaying(true)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" onClick={() => setPlaying(false)}>
          KAMPEON<span>!</span>
        </a>
        <div className="topbar-meta">
          <span className="season-mark">THE GRAND TORNEO NG MAHARLIKA</span>
          <span className="build-mark"><i /> PROTOTYPE 01</span>
        </div>
      </header>

      {playing ? (
        <section className="fight-page" aria-label="Player versus AI match">
          <div className="match-heading">
            <span>ARCADE MODE / SINGLE MATCH</span>
            <button className="text-button" onClick={() => setPlaying(false)}>EXIT MATCH</button>
          </div>
          <CombatHUD
            health={snapshot.health}
            remainingSeconds={snapshot.remainingSeconds}
            playerName={prototypeFighters.find((fighter) => fighter.id === fighterId)!.name}
            opponentName={opponent.name}
          />
          <div className="arena-frame">
            <PhaserGame
              key={matchKey}
              playerFighterId={fighterId}
              onSnapshot={setSnapshot}
              onRoundEnd={setResult}
            />
            {result && (
              <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
                <span className="eyebrow">ROUND COMPLETE</span>
                <h2 id="result-title">
                  {result.winner === 'draw' ? 'DRAW' : `${result.winner === 1 ? 'PLAYER 1' : 'CPU'} WINS`}
                </h2>
                <p>{result.reason === 'time' ? 'TIME UP' : 'KNOCKOUT'}</p>
                <div className="result-actions">
                  <button className="primary-button" onClick={() => {
                    setMatchKey((value) => value + 1)
                    startMatch()
                  }}>REMATCH <span aria-hidden="true">↻</span></button>
                  <button className="secondary-button" onClick={() => setPlaying(false)}>MAIN MENU</button>
                </div>
              </div>
            )}
          </div>
          <div className="controls-strip">
            <span className="controls-label">PLAYER 1</span>
            <span><kbd>A</kbd><kbd>D</kbd> MOVE</span>
            <span><kbd>W</kbd> JUMP</span>
            <span><kbd>S</kbd> CROUCH</span>
            <span><kbd>J</kbd> LIGHT</span>
            <span><kbd>K</kbd> HEAVY</span>
            <span><kbd>L</kbd> BLOCK</span>
            <span><kbd>U</kbd> SPECIAL</span>
          </div>
        </section>
      ) : (
        <section className="menu-page" id="home">
          <div className="menu-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> MANILA / 1898 : THE ARENA OPENS</div>
            <h1>THE GRAND<br /><em>TORNEO</em></h1>
            <p className="intro-copy">Legends meet beneath the walls of Intramuros. Choose your fighter and claim the first round.</p>
            <div className="menu-rule"><span>01</span><span>PLAYER VS AI</span><span className="rule-active">AVAILABLE NOW</span></div>
            <div className="menu-rule menu-disabled"><span>02</span><span>2 PLAYER LOCAL</span><span>IN DEVELOPMENT</span></div>
            <div className="menu-rule menu-disabled"><span>03</span><span>ONLINE MULTIPLAYER</span><span>COMING SOON</span></div>
          </div>

          <div className="selection-panel">
            <div className="selection-head">
              <div><span className="eyebrow">SELECT YOUR FIGHTER</span><h2>Choose a side.</h2></div>
              <span className="select-index">01 / 02</span>
            </div>
            <div className="fighter-options" role="group" aria-label="Select player fighter">
              {prototypeFighters.map((fighter, index) => (
                <button
                  className={`fighter-option ${fighterId === fighter.id ? 'selected' : ''}`}
                  key={fighter.id}
                  onClick={() => setFighterId(fighter.id)}
                  aria-pressed={fighterId === fighter.id}
                  style={{ '--fighter-color': fighter.color, '--fighter-accent': fighter.accent } as React.CSSProperties}
                >
                  <span className={`portrait portrait-${fighter.id}`} aria-hidden="true">
                    <span className="portrait-sun" /><span className="portrait-body" />
                  </span>
                  <span className="fighter-info">
                    <span className="fighter-number">FIGHTER 0{index + 1}</span>
                    <strong>{fighter.name}</strong>
                    <span>{fighter.style}</span>
                  </span>
                  <span className="fighter-check" aria-hidden="true">{fighterId === fighter.id ? '●' : '○'}</span>
                </button>
              ))}
            </div>
            <div className="versus-line"><span>YOUR OPPONENT</span><strong>{opponent.name}</strong><span className="cpu-chip">CPU</span></div>
            <button className="primary-button launch-button" onClick={startMatch}>ENTER THE ARENA <span aria-hidden="true">→</span></button>
            <div className="select-footer"><span>BEST OF ONE / 99 SEC</span><span>OFFLINE READY</span></div>
          </div>
          <div className="menu-footer"><span>MAHARLIKA FIGHTING CIRCUIT</span><span>BUILT FOR THE BRAVE</span></div>
        </section>
      )}
    </main>
  )
}

export default App
