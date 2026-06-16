# Mahjong Web App — Design Spec
_Date: 2026-06-16_

## Overview

A browser-based multiplayer mahjong app for casual play with friends during school breaks. PC-only layout. Supports Singapore/Malaysian and Hong Kong rule variants, configurable house rules, bots for fewer than 4 players, and an in-app tutorial system.

---

## 1. Architecture

**Single repo, two parts:**

```
mahjong/
  server/    — Express + Socket.io (game state, room management, bot AI)
  client/    — Vite + React (game UI, tutorial)
```

**Deployment:** Single Node.js server on Railway. The Express server serves the compiled Vite/React build as static files and handles Socket.io WebSocket connections on the same port.

**Game state:** Authoritative server-side only. Clients receive a filtered view of state (they see only their own hand tiles, not opponents'). All moves are validated server-side before being applied.

**Persistence:** None required. Rooms are in-memory and last only as long as the session. Server restart clears all rooms (acceptable for casual play).

**No login/auth:** Players join rooms anonymously via a 6-character room code.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript |
| Backend | Node.js + Express + Socket.io |
| Styling | Tailwind CSS (dark green theme) |
| Hosting | Railway (single service) |

---

## 3. Supported Variants

| Feature | Singapore (SG) | Hong Kong (HK) |
|---|---|---|
| Flower/season tiles | Yes (8 tiles, seat-matched) | Optional (OFF by default) |
| Animal tiles | Yes | No |
| Chow allowed | Yes (configurable) | Yes |
| Minimum tai | 3 (configurable) | 3 fan (configurable) |
| Default tai table | SG defaults | HK defaults |

The host selects the variant when creating a room. Each variant has its own default tai table. Both share the same 108 suit tiles + 28 honor tiles base.

---

## 4. Tile Set

| Group | Count | Notes |
|---|---|---|
| Bamboo 1–9 × 4 | 36 | |
| Circles 1–9 × 4 | 36 | |
| Characters 1–9 × 4 | 36 | |
| Winds (East/South/West/North) × 4 | 16 | |
| Dragons (Red/Green/White) × 4 | 12 | |
| Flowers (Plum/Orchid/Chrysanthemum/Bamboo) | 4 | Seat-matched: player 1–4 |
| Seasons (Spring/Summer/Autumn/Winter) | 4 | Seat-matched: player 1–4 |
| Animals (Rat/Chicken/Worm/Cat) | 4 | Bonus tiles, not seat-matched |
| Fei (joker/wildcard) | 2 tiles when enabled | House rule: ON/OFF |
| **Total (base SG, no Fei)** | **148** | |

**Bonus tile rules:**
- Flowers and seasons: when drawn, reveal it (shown publicly), draw a replacement tile. Each matching flower/season scores 1 tai.
- Animals (Rat, Chicken, Worm, Cat): same reveal-and-replace mechanic.
- **Yao bonus:** Having both Rat+Cat OR both Chicken+Worm scores a yao. Payout style is room-configurable: either +1 unit paid by all losers, or +1 tai added to the winning hand's score.
- **Fei (wildcard):** When enabled, Fei tiles substitute for any tile in the hand. Drawn and used silently (not revealed). ON/OFF per room.

---

## 5. Game Flow

1. Host creates room, sets variant + house rules, shares 6-char code.
2. Players join (1–3 human players; remaining seats filled by bots at host's chosen difficulty).
3. Host starts the game.
4. Seats assigned, prevailing wind set (East round), dealer determined.
5. Tiles shuffled server-side. Dealer gets 14 tiles, others get 13.
6. Bonus tiles (flowers/seasons/animals) automatically replaced during deal; replacements cascade if another bonus is drawn.
7. Dealer discards to start. Turn order: counter-clockwise.
8. Each turn:
   a. Active player draws from wall (or has been granted a claim).
   b. Active player discards one tile.
   c. **Claim window opens** (5 seconds): all other players may claim the discard for pong/kong/win. Chow (next player only) has no timer — player may take as long as needed.
   d. Priority: win > pong/kong > chow. Server enforces priority if multiple claims.
   e. Claimed tile applied; claiming player's turn begins.
9. Round ends on:
   - A player wins (hu).
   - Wall exhausted — draw, no payout.
10. Scoring calculated, payments applied (see §8). Next round begins.

---

## 6. Claim & Auto-Claim System

**Claim window:**
- Pong / Kong / Win: 5-second countdown timer visible to all players.
- Chow: No timer. Next player may chow at any time before the active player draws.
- If no one claims within 5 seconds, active player draws from wall.

**Auto-claim settings (per player, stored in browser):**
- Players configure a list of specific tiles for auto-pong and auto-kong separately.
  - Example: "auto-pong Red Dragon, Green Dragon" but not "5 Bamboo."
- Auto-win is **never available** — player must manually click WIN.
- Auto-chow is not offered.
- Settings persist in localStorage across sessions.

---

## 7. House Rules Configuration

Set by host at room creation. Locked once game starts. Visible to all players in a sidebar.

| Rule | Options | Default (SG) |
|---|---|---|
| Variant | Singapore / Hong Kong | Singapore |
| Minimum tai to win | 1 / 3 / 5 / custom | 3 |
| Maximum tai cap | None / 5 / 8 / custom | None |
| Allow 7 pairs | On / Off | On |
| Allow 13 orphans | On / Off | On |
| Flower & season tiles | On / Off | On |
| Animal tiles | On / Off | On |
| Yao payout style | +1 unit / +1 tai | +1 unit |
| Fei (wildcard joker) | On / Off | Off |
| Allow chow | On / Off | On |
| Lv yi se (Pure Green) | Recognized / Not recognized | Recognized |
| Da si xi — require non-wind pair | Strict / Any pair | Any pair |
| Da san yuan — require non-dragon pair | Strict / Any pair | Any pair |
| Dealer bonus on win | On / Off | On |
| Self-draw (zimo) bonus | On / Off | On |
| Point unit value | Custom number | 0.10 |

**Custom tai table:**
- Host sees a full list of every recognized hand with its default tai value.
- Each entry is editable (numeric input).
- Separate defaults for SG and HK modes.
- Presets can be saved by name to localStorage and loaded in future rooms.

---

## 8. Scoring

- Winning player's hand evaluated server-side for all applicable tai/fan.
- Payments:
  - **Ron (discard win):** Discarding player pays winner. Default formula: `2^tai × unit`. The tai table is fully custom (§7), so effective payout is determined by the host's configured tai values.
  - **Zimo (self-draw):** All 3 opponents each pay winner the same amount.
  - **Yao bonus:** Per room setting (+1 unit from all or +1 tai to hand).
  - **Animal bonuses:** Displayed in hand summary; included in tai count.
- Dealer retains dealer position on win or draw; passes on loss.
- Running score tracked and shown to all players throughout the session.

---

## 9. Bot AI

Bots fill empty seats. Host sets difficulty per bot (Easy / Medium / Hard) when starting.

| Difficulty | Discard strategy | Claim strategy |
|---|---|---|
| Easy | Mostly random, avoids obvious isolated tiles | Claims pong/win opportunistically |
| Medium | Tile efficiency (minimizes tiles needed to win) | Aware of discard danger, avoids feeding opponents |
| Hard | Danger tile tracking, hand value optimization | Balances speed vs. hand value |

- Bots "think" for 1–3 seconds (randomized) before acting.
- Bots respond within the 5-second claim window like human players.
- Bots claim chow immediately (no wait).
- Bots always win immediately when they can.
- Bot names default to fun names ("Auntie Bot", "Uncle Algorithm"); host can rename.

---

## 10. UI & Visual Style

**Theme:** Dark Classic — deep green felt (#1a472a background), cream tiles (#f5e6c8), gold accents (#ffd700).

**Table layout:**
- Player (you) at the bottom, hand displayed face-up.
- Opponent at top (North), face-down tiles shown as a row.
- Opponents at left (West) and right (East), face-down tiles shown vertically.
- Center: 4 discard pools in quadrants (each player's discards in their quadrant).
- Drawn tile highlighted with a gold glow.
- Action buttons (WIN / PONG / KONG / CHOW / PASS) appear contextually.
- 5-second timer bar shown under action buttons during claim window.
- Wall tile count shown at all times.
- Game info sidebar: current round, prevailing wind, seat winds, scores, house rules summary.

**Revealed melds:** Shown to the side of the player's hand (or below opponent strips).

**Winning screen:** Full hand displayed with each element labeled and tai breakdown listed.

---

## 11. Tutorial System

Accessible from home screen and as a mid-game overlay (via "?" button).

1. **Tile recognition guide** — all tile types with English + Chinese names, visual examples.
2. **Basic rules walkthrough** — animated step-by-step: dealing, drawing, discarding, sets, winning. User clicks "next" to advance.
3. **Hand examples gallery** — common winning hands with tai values, filterable by SG/HK mode.
4. **Scoring calculator** — interactive tile picker; assemble any hand, see scoring under current room's house rules.
5. **Quick reference card** — single-page overlay: claim priority, common hands, tai table.

---

## 12. Room Flow (User Journey)

```
Home screen
  ├── Create Room → configure house rules → share code → wait for players → start
  ├── Join Room → enter code → lobby → wait for host to start
  └── Tutorial → tile guide / walkthrough / hand examples / calculator

In-game
  ├── Game table (main view)
  ├── Settings overlay (auto-pong/kong tile config)
  ├── House rules sidebar (read-only)
  └── Tutorial overlay ("?" button)

Post-round
  └── Scoring summary → next round / leave
```

---

## 13. Out of Scope

- Persistent accounts or cross-session stats.
- Mobile layout.
- Real money handling (unit value is display-only).
- Replay system.
- Chat (can be added later).
- Spectator mode.
