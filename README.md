# KAMPEON! — The Grand Torneo ng Maharlika

Milestone 1 prototype: a responsive browser-based Player vs AI fighting game built with React, TypeScript, and Phaser 3. Fighter artwork is temporary geometric placeholder art.

## Run locally

```sh
npm install
npm run dev
```

## Controls

| Action | Key |
| --- | --- |
| Move | A / D |
| Jump / crouch | W / S |
| Light / heavy attack | J / K |
| Block / special | L / U |

Controls are active during a match. Browser defaults for gameplay keys are suppressed only while the match is active.

## Checks

```sh
npm run test -- --run
npm run build
```

## Current scope

- Playable single-round Player vs AI prototype with Hunyo and Hulyo.
- Keyboard movement, jump, crouch, light/heavy attacks, blocking, and distinct prototype special moves.
- Responsive arena container and HUD; the arena uses a fixed 16:9 game world scaled to its viewport.
- Desktop keyboard play only. Local two-player, touch controls, full fighter roster, polished pixel-art assets, and online play are not implemented yet.
- Offline play is available after the app has loaded; first-visit offline use is not guaranteed.